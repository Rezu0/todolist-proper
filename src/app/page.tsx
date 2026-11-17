import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { getUserId } from "@/lib/auth";
import { toReminder, toTask, type ReminderDoc, type TaskDoc } from "@/lib/serialize";
import { normalizeSettings } from "@/lib/settings";
import { toList, toShow, type ListDoc, type ShowDoc } from "@/lib/serializeLists";
import User from "@/models/User";
import Task from "@/models/Task";
import Reminder from "@/models/Reminder";
import Checklist, { ChecklistShow } from "@/models/Checklist";
import Board from "@/components/Board";

export const metadata = {
  title: "Dashboard",
  description: "Kelola task dan pengingat harian kamu.",
};

async function BoardLoader() {
  const uid = await getUserId();
  if (!uid) redirect("/login");

  await connectDB();

  const [user, tasks, reminders, lists, shows] = await Promise.all([
    User.findById(uid).select("name email settings").lean<{ name?: string; email: string; settings?: unknown }>(),
    Task.find({ userId: uid }).sort({ createdAt: 1 }).lean<TaskDoc[]>(),
    Reminder.find({ userId: uid }).sort({ createdAt: 1 }).lean<ReminderDoc[]>(),
    Checklist.find({ userId: uid }).sort({ createdAt: 1 }).lean<ListDoc[]>(),
    ChecklistShow.find({ userId: uid }).lean<ShowDoc[]>(),
  ]);

  if (!user) redirect("/login");

  return (
    <Board
      initialTasks={tasks.map(toTask)}
      initialReminders={reminders.map(toReminder)}
      initialLists={lists.map(toList)}
      initialShows={shows.map(toShow)}
      userName={user.name || user.email}
      initialSettings={normalizeSettings(user.settings)}
    />
  );
}

export default function Home() {
  // Pembungkus layar (warna tema, padding) ada di Board agar ikut berubah saat Style diganti
  return (
    <Suspense fallback={null}>
      <BoardLoader />
    </Suspense>
  );
}