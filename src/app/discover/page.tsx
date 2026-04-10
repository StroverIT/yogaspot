import type { Metadata } from "next";
import Discover from "@/views/Discover";

export const metadata: Metadata = {
  title: "Открий студио | Zenno",
  description:
    "Намери най-доброто йога студио близо до теб. Филтрирай по ниво, тип йога и рейтинг.",
};

export default function DiscoverPage() {
  return <Discover />;
}
