import { DEFAULT_PAGE } from "@/constants";
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

type MeetingStatus = "upcomming" | "active" | "completed" | "processing" | "cancelled";
const statusOptions: MeetingStatus[] = ["upcomming", "active", "completed", "processing", "cancelled"];

export const useMeetingsFilters = () => {
    return useQueryStates({
        search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
        page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
        agentId: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
        status: parseAsStringEnum<MeetingStatus>(statusOptions).withOptions({ clearOnDefault: true }),
    });
};
