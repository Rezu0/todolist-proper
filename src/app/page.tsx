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
import Image from "@/models/Image";
import Board from "@/components/Board";

export const metadata = {
  title: "Dashboard",
  description: "Kelola task dan pengingat harian kamu.",
};

async function BoardLoader() {
  const uid = await getUserId();
  if (!uid) redirect("/login");

  await connectDB();

  const [user, tasks, reminders, lists, shows, imgs] = await Promise.all([
    User.findById(uid).select("name email settings").lean<{ name?: string; email: string; settings?: unknown }>(),
    Task.find({ userId: uid }).sort({ createdAt: 1 }).lean<TaskDoc[]>(),
    Reminder.find({ userId: uid }).sort({ createdAt: 1 }).lean<ReminderDoc[]>(),
    Checklist.find({ userId: uid }).sort({ createdAt: 1 }).lean<ListDoc[]>(),
    ChecklistShow.find({ userId: uid }).lean<ShowDoc[]>(),
    // Hanya id dan taskId; byte fotonya tidak ikut dimuat
    Image.find({ userId: uid }).select("_id taskId").sort({ createdAt: 1 }).lean<{ _id: { toString(): string }; taskId: { toString(): string } }[]>(),
  ]);

  const imagesByTask = new Map<string, string[]>();
  for (const im of imgs) {
    const k = im.taskId.toString();
    imagesByTask.set(k, [...(imagesByTask.get(k) ?? []), im._id.toString()]);
  }

  if (!user) redirect("/login");

  return (
    <Board
      initialTasks={tasks.map((d) => ({ ...toTask(d), images: imagesByTask.get(d._id.toString()) ?? [] }))}
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