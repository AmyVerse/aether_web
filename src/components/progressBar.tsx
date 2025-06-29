import Image from "next/image";

export default function ProgressBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-xl p-4 md:p-5 flex flex-col sm:flex-row items-center gap-4 mt-2 mb-4">
      <Image
        src="/profile.png" // Use your own image asset here
        alt=""
        width={80}
        height={80}
        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0"
      />
      <div className="text-center sm:text-left">
        <div className="text-white text-base md:text-lg font-medium">
          Your students average progress is{" "}
          <span className="font-bold text-yellow-200">73%</span>.
        </div>
        <div className="text-indigo-100 text-sm">
          Level up your students to improve your teacher rank!
        </div>
      </div>
    </div>
  );
}
