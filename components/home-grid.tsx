import Image from "next/image";
import { ArrowUpRight, Camera } from "lucide-react";
import { SiSubstack } from "@icons-pack/react-simple-icons";
import { CustomButton } from "@/ui/components/CustomButton";
import { homeTiles } from "@/lib/home-grid";

export function HomeGrid() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-4 sm:px-8 sm:pt-8"
    >
      <h1 className="sr-only">Jack Rocca</h1>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {homeTiles.map((tile) => (
          <CustomButton
            key={tile.href}
            href={tile.href}
            external={tile.external}
            aria-label={tile.label}
            variant="unstyled"
            className={`group relative aspect-square h-auto w-full overflow-hidden rounded-none p-0 ${tile.mark === "pick4" ? "bg-neutral-950 text-white hover:bg-neutral-900" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}
          >
            {tile.image ? (
              <Image
                src={tile.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover"
              />
            ) : tile.mark === "photography" ? (
              <Camera
                aria-hidden="true"
                strokeWidth={1.1}
                className="size-10 sm:size-14"
              />
            ) : tile.mark === "pick4" ? (
              <Image
                src="/pick4-icon.svg"
                alt=""
                width={120}
                height={120}
                className="size-20 sm:size-28"
              />
            ) : (
              <SiSubstack aria-hidden="true" className="size-10 sm:size-14" />
            )}
            <ArrowUpRight
              aria-hidden="true"
              strokeWidth={1.5}
              className="absolute right-4 top-4 size-4 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:right-5 sm:top-5"
            />
          </CustomButton>
        ))}
      </div>
    </main>
  );
}
