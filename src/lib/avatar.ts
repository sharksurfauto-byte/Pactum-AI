import { botttsNeutral } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import { initials } from "@dicebear/collection";

interface GenerateAvatarUriProps {
    seed: string;
    variant: "botttsNeutral" | "initials";
}

export const generateAvatarUri = ({ seed, variant }: GenerateAvatarUriProps): string => {
    let avatar;

    if (variant === "botttsNeutral") {
        avatar = createAvatar(botttsNeutral, {
            seed,
        });
    } else {
        avatar = createAvatar(initials, {
            seed,
        });
    }

    return avatar.toDataUri();
};
