import { useState } from "react";
import BottomNav from "./components/BottomNav";
import PhotosTab from "./tabs/PhotosTab";
import MemoriesTab from "./tabs/MemoriesTab";
import TodosTab from "./tabs/TodosTab";

export default function App() {
  const [tab, setTab] = useState<"photos" | "memories" | "todo">("memories");

  return (
    <>
      {/* Contenu principal */}
      {tab === "photos" && <PhotosTab />}
      {tab === "memories" && <MemoriesTab />}
      {tab === "todo" && <TodosTab />}

      {/* Navbar */}
      <BottomNav current={tab} onChange={setTab} />
    </>
  );
}