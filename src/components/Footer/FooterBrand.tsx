import Image from "next/image";

export function FooterBrand() {
  return (
    <div className="col-span-4 -mt-6">
      <div className="flex items-center gap-3">
        <div className="relative h-64 w-64 shrink-0 -mt-10 -mb-20">
          <Image
            src="/homepage/logo-white.png"
            alt=""
            fill
            className="object-contain"
            sizes="80px"
          />
        </div>

      </div>
      <p className="max-w-sm text-white/80">
        Zenno е marketplace за йога, който свързва практикуващи с най-добрите
        студиа. Открий, избери и практикувай.
      </p>

    </div>
  );
}
