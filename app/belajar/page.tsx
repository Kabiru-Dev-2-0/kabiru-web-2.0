"use client";

import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { LearningPathCard } from "@/components/learning-path-card";
import { ProgressCourseCard } from "@/components/progress-course-card";

export default function BelajarPage() {
  const ongoingCourses = [
    {
      title: "Logika dan Berpikir Komputasional",
      description: "Lorem ipsum dolor sit lorem ipsum dolor sit amet.",
      progress: 5,
      total: 20,
      icon: "📊",
      category: "Learning Path",
    },
    {
      title: "Dasar Algoritma dan Pemrograman",
      description: "Lorem ipsum dolor sit lorem ipsum dolor sit amet.",
      progress: 5,
      total: 20,
      icon: "🧬",
      category: "Learning Path",
    },
  ];

  const learningPaths = [
    {
      title: "Pengenalan Kecerdasan Artifisial",
      description: "Lorem ipsum dolor sit amet lorem ipsum dolor sit amet",
      modules: 3,
      icon: "🤖",
      buttonText: "Mulai Belajar",
      isStarted: false,
    },
    {
      title: "Logika dan Berpikir Komputasional",
      description: "Lorem ipsum dolor sit amet lorem ipsum dolor sit amet",
      modules: 3,
      icon: "🧠",
      buttonText: "Lanjutkan",
      isStarted: true,
    },
    {
      title: "Dasar Algoritma dan Pemrograman",
      description: "Lorem ipsum dolor sit amet lorem ipsum dolor sit amet",
      modules: 3,
      icon: "💻",
      buttonText: "Lanjutkan",
      isStarted: true,
    },
    {
      title: "Analisis Data untuk AI",
      description: "Lorem ipsum dolor sit amet lorem ipsum dolor sit amet",
      modules: 3,
      icon: "📊",
      buttonText: "Mulai Belajar",
      isStarted: false,
    },
    {
      title: "Konsep Dasar Kecerdasan Artifisial",
      description: "Lorem ipsum dolor sit amet lorem ipsum dolor sit amet",
      modules: 3,
      icon: "🎯",
      buttonText: "Mulai Belajar",
      isStarted: false,
    },
    {
      title: "Pengenalan Kecerdasan Artifisial",
      description: "Lorem ipsum dolor sit amet lorem ipsum dolor sit amet",
      modules: 3,
      icon: "🚀",
      buttonText: "Mulai Belajar",
      isStarted: false,
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#FCFDFD]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-8">
            {/* Lanjutkan Section */}
            <div className="flex gap-2.5">
              {/* Left: Ongoing Courses */}
              <div className="flex-1 bg-white rounded-[14px] p-[14px] flex flex-col gap-[14px]">
                <div className="flex items-center gap-2.5">
                  <div className="text-4xl">📚</div>
                  <h2 className="text-2xl font-semibold leading-8 text-black">
                    Lanjutkan
                  </h2>
                </div>

                <div className="flex gap-[14px]">
                  {ongoingCourses.map((course, index) => (
                    <div key={index} className="w-[363px]">
                      <ProgressCourseCard {...course} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Tooltip */}
              <div className="w-[270px] h-[250px] relative">
                <div className="absolute left-[-52px] top-[19px]">
                  <div className="relative">
                    <div className="bg-white rounded-lg p-1 shadow-lg shadow-primary/20">
                      <p className="text-base font-normal leading-6 text-black text-center">
                        Ayo lanjutkan
                        <br />
                        belajarmu!
                      </p>
                    </div>
                    {/* Arrow indicator */}
                    <div className="absolute right-[-8px] top-[36px] w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white" />
                  </div>
                </div>

                {/* Character */}
                <div className="w-[238px] h-[230px] ml-[17px] mt-5 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-9xl">
                  👨‍🎓
                </div>
              </div>
            </div>

            {/* Learning Path Section */}
            <div className="flex flex-col gap-[14px]">
              <div className="flex items-center gap-2.5">
                <div className="text-4xl">💡</div>
                <h2 className="text-2xl font-semibold leading-8 text-black">
                  Learning Path
                </h2>
              </div>

              {/* First Row */}
              <div className="grid grid-cols-3 gap-5">
                {learningPaths.slice(0, 3).map((path, index) => (
                  <LearningPathCard key={index} {...path} />
                ))}
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-3 gap-5">
                {learningPaths.slice(3, 6).map((path, index) => (
                  <LearningPathCard key={index + 3} {...path} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

