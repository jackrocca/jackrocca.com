import hashlib
import importlib.util
import sqlite3
import tempfile
import unittest
from pathlib import Path

spec=importlib.util.spec_from_file_location('exporter',Path(__file__).parents[1]/'scripts/photography/read_catalog.py')
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class ExportTests(unittest.TestCase):
    def test_ranked_edits_privacy_and_read_only(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);(root/'catalog').mkdir();(root/'library/previews').mkdir(parents=True)
            db=root/'catalog/photography.sqlite';c=sqlite3.connect(db)
            c.executescript('''
              CREATE TABLE assets(id TEXT, star_rating INTEGER, capture_at TEXT,place_name TEXT,place_admin TEXT,place_country TEXT,status TEXT);
              CREATE TABLE asset_representative_map(asset_id TEXT,annotation_family_id TEXT,representative_asset_id TEXT);
              CREATE TABLE asset_variants(asset_id TEXT,variant_type TEXT,path TEXT);
              CREATE TABLE asset_person_manual(asset_id TEXT,person_id INTEGER);
              CREATE TABLE face_detections(id INTEGER,asset_id TEXT,status TEXT);
              CREATE TABLE person_faces(person_id INTEGER,face_detection_id INTEGER);
              CREATE TABLE asset_people(asset_id TEXT,person_id INTEGER,face_cluster_id INTEGER);
              CREATE TABLE face_clusters(id INTEGER,label_status TEXT);
              CREATE TABLE people(id INTEGER,display_name TEXT,privacy_level TEXT,hidden_at TEXT);
            ''')
            for id,rating,status in [('original',0,'active'),('edit',5,'active'),('lower',1,'active'),('trash',5,'trashed')]:
                preview=root/'library/previews'/f'{id}.jpg';preview.write_bytes(b'preview')
                c.execute('insert into assets values(?,?,NULL,NULL,NULL,NULL,?)',(id,rating,status))
                c.execute('insert into asset_variants values(?,?,?)',(id,'preview',str(preview)))
            for id in ['original','edit','lower']: c.execute('insert into asset_representative_map values(?,?,?)',(id,'family','original'))
            for id,name,privacy,hidden in [(1,'Visible','normal',None),(2,'Private','private',None),(3,'Hidden','normal','now')]:
                c.execute('insert into people values(?,?,?,?)',(id,name,privacy,hidden))
                c.execute('insert into asset_person_manual values(?,?)',('edit',id))
            c.commit();c.close();before=hashlib.sha256(db.read_bytes()).hexdigest()
            result=module.read_catalog(root)['photos']
            self.assertEqual(len(result),1);self.assertEqual(result[0]['sourceId'],'edit');self.assertEqual(result[0]['rating'],5)
            self.assertEqual(result[0]['people'],[{'id':'1','name':'Visible'}])
            self.assertEqual(hashlib.sha256(db.read_bytes()).hexdigest(),before)
            (root/'library/previews/edit.jpg').unlink()
            with self.assertRaises(ValueError): module.read_catalog(root)

if __name__=='__main__': unittest.main()
