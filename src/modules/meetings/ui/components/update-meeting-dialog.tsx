import { ResponsiveDialog } from "@/components/responsive-dialog";
import { MeetingGetOne } from "../../types";
import { MeetingForm } from "../components/meeting-form";

interface UpdateMeetingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialValues: MeetingGetOne;
}

export const UpdateMeetingDialog: React.FC<UpdateMeetingDialogProps> = ({
    open,
    onOpenChange,
    initialValues
}) => {
    return (
        <ResponsiveDialog
            title="Edit Meeting"
            description="Edit the details of your meeting"
            open={open}
            onOpenChange={onOpenChange}
        >
            <MeetingForm
                initialValues={initialValues}
                onSuccess={() => onOpenChange(false)}
                onCancel={() => onOpenChange(false)}
            />
        </ResponsiveDialog>
    );
};
