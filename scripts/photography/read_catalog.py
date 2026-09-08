"""Read Atlas without importing its mutation/migration code. Output is local-only."""
import argparse
import json
from pathlib import Path
import sqlite3


def read_catalog(root):
    root = Path(root).expanduser().resolve()
    db = root / 'catalog/photography.sqlite'
    # WAL snapshots need normal SQLite coordination. A quiescent main DB can be
    # read immutably without creating journal files in the source archive.
    wal = Path(str(db) + '-wal')
    immutable = not (wal.exists() and wal.stat().st_size)
    before = db.stat()
    conn = sqlite3.connect(db.as_uri() + '?mode=ro' + ('&immutable=1' if immutable else ''), uri=True)
    conn.row_factory = sqlite3.Row
    conn.execute('BEGIN')
    rows = conn.execute('''
      SELECT a.id, a.star_rating, a.capture_at, a.place_name, a.place_admin,
             a.place_country, v.path,
             COALESCE(m.annotation_family_id, a.id) AS family,
             COALESCE(m.representative_asset_id, a.id)=a.id AS representative
      FROM assets a LEFT JOIN asset_representative_map m ON m.asset_id=a.id
      JOIN asset_variants v ON v.asset_id=a.id AND v.variant_type='preview'
      WHERE a.status='active' AND a.star_rating BETWEEN 1 AND 5
      ORDER BY a.star_rating DESC, representative DESC, a.capture_at DESC, a.id
    ''').fetchall()
    # Highest rated version wins, then Atlas representative. Inconsistent legacy
    # version ratings must never discard a deliberately rated edit.
    families = {}
    for row in rows:
        families.setdefault(row['family'], row)
    person_rows = conn.execute('''
      SELECT DISTINCT COALESCE(m.annotation_family_id, links.asset_id) family,
             p.id, p.display_name
      FROM (
        SELECT asset_id,person_id FROM asset_person_manual
        UNION SELECT d.asset_id,pf.person_id FROM person_faces pf
              JOIN face_detections d ON d.id=pf.face_detection_id AND d.status='active'
        UNION SELECT ap.asset_id,ap.person_id FROM asset_people ap
              JOIN face_clusters fc ON fc.id=ap.face_cluster_id
              WHERE fc.label_status='confirmed'
      ) links
      JOIN assets linked ON linked.id=links.asset_id AND linked.status='active'
      JOIN people p ON p.id=links.person_id
      LEFT JOIN asset_representative_map m ON m.asset_id=links.asset_id
      WHERE p.hidden_at IS NULL AND p.privacy_level='normal'
    ''').fetchall()
    people = {}
    for row in person_rows:
        people.setdefault(row['family'], {})[str(row['id'])] = row['display_name']
    photos = []
    for family, row in families.items():
        preview = Path(row['path']).resolve()
        if not preview.is_relative_to(root / 'library/previews'):
            raise ValueError('Preview is outside the archive preview directory')
        if not preview.is_file():
            raise ValueError('A ranked preview is missing; publication stopped')
        place = ', '.join(dict.fromkeys(str(row[k]).strip() for k in ('place_name','place_admin','place_country') if row[k]))
        photos.append({
            'sourceId': row['id'], 'preview': str(preview), 'rating': row['star_rating'],
            'takenAt': (row['capture_at'] or '')[:10],
            'capturedAt': row['capture_at'] or '', 'place': place,
            'people': [{'id': k, 'name': v} for k,v in sorted(people.get(family, {}).items())],
        })
    conn.close()
    after = db.stat()
    if immutable and (before.st_mtime_ns, before.st_size) != (after.st_mtime_ns, after.st_size):
        raise RuntimeError('Archive changed during export; retry when idle')
    return {'photos': photos}

if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--root', required=True)
    args=parser.parse_args()
    print(json.dumps(read_catalog(args.root)))
