import Image from "next/image";

export function Heroes() {
  return (
    <div className="flex justify-center items-center max-w-5xl">
      <div className="flex items-center">
        <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:h-[350px] md:w-[350px]">
          <Image
            className="object-contain dark:hidden"
            src="/documents.png"
            alt="Documents"
            fill
          />
          <Image
            className="object-contain hidden dark:block"
            src="/documents-dark.png"
            alt="Documents"
            fill
          />
        </div>
        <div className="relative w-[330px] h-[330px] hidden md:block">
          <Image
            className="object-contain dark:hidden"
            src="/reading.png"
            alt="Reading"
            fill
          />
          <Image
            className="object-contain hidden dark:block"
            src="/reading-dark.png"
            alt="Reading"
            fill
          />
        </div>
      </div>
    </div>
  );
}
