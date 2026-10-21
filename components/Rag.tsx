import { Rag as R } from "@/lib/api";
const label = { RED: "Red", AMBER: "Amber", GREEN: "Green" };
export default function Rag({ s }: { s: R }) {
  return <span className={`rag rag-${s.toLowerCase()}`}><i />{label[s]}</span>;
}
