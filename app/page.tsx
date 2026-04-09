import Link from "next/link";

const studentGroups = [
  { id: 1, name: "Group 1", nameZh: "第一组", members: 3 },
  { id: 2, name: "Group 2", nameZh: "第二组", members: 3 },
  { id: 3, name: "Group 3", nameZh: "第三组", members: 3 },
  { id: 4, name: "Group 4", nameZh: "第四组", members: 2 },
];

const teacherGroup = { id: 5, name: "Teacher Demo", nameZh: "老师体验组", members: 0 };

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-2 text-5xl">💡</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          孤独经济 Startup Competition
        </h1>
        <p className="text-lg text-rose-600 font-medium mb-1">
          Loneliness Economy · Creative Product Design
        </p>
        <p className="text-sm text-gray-500 mb-10">
          Lesson 28 Activity · Describe your product in Chinese, AI generates concept art
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {studentGroups.map((g) => (
            <Link key={g.id} href={`/group/${g.id}`}>
              <div className="group relative bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:border-rose-300 transition-all duration-200 cursor-pointer">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {g.name}
                </div>
                <div className="text-sm text-gray-500">{g.nameZh} · {g.members} members</div>
                <div className="absolute top-3 right-3 text-gray-300 group-hover:text-rose-400 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link href={`/group/${teacherGroup.id}`}>
          <div className="group mb-10 bg-amber-50 rounded-2xl border border-amber-200 p-4 shadow-sm hover:shadow-lg hover:border-amber-400 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2">
            <span className="text-lg">🍎</span>
            <span className="text-base font-medium text-amber-800">
              {teacherGroup.name}
            </span>
            <span className="text-amber-400 group-hover:text-amber-600 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </div>
        </Link>

        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          Gallery (Teacher View)
        </Link>
      </div>
    </main>
  );
}
