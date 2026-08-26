import type { Metadata } from "next";
import LocalCityPageView, {
  buildLocalCityMetadata,
} from "@/src/components/public/local-city-page";
import { LOCAL_CITY_PAGES } from "@/src/lib/public/local-city-pages";

const page = LOCAL_CITY_PAGES["conciergerie-automobile-gisors"];

export const metadata: Metadata = buildLocalCityMetadata(page);

export default function ConciergerieGisorsPage() {
  return <LocalCityPageView page={page} />;
}
