import { DEFAULT_PAGE } from "@/constants";
import { createLoader, parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs/server";

type MeetingStatus = "upcomming" | "active" | "completed" | "processing" | "cancelled";
const statusOptions: MeetingStatus[] = ["upcomming", "active", "completed", "processing", "cancelled"];

export const meetingsFiltersSearchParams = {
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
    agentId: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    status: parseAsStringEnum<MeetingStatus>(statusOptions).withOptions({ clearOnDefault: true }),
};

export const loadMeetingsSearchParams = createLoader(meetingsFiltersSearchParams);
