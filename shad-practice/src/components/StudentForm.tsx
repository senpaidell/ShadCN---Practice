import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email"),
    age: z.coerce.number().min(16, "Must be 16+"),
    course: z.string().min(2, "Course is required"),
});

type StudentFormValues = z.infer<typeof formSchema>;

export function StudentForm({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false);

    const form = useForm <StudentFormValues> ({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            age: 0,
            course: "",
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await axios.post("api/students", values);
            setOpen(false);
            form.reset();
            onSuccess();

            toast.success("Student Added!", {
                description: `${values.name} has been added to the database.`
            })
        } catch (error) {
            console.error("Error adding student", error);

            toast.error("Something went wrong", {
                description: "Please try again later.",
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add Student</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425ox]">
                <DialogHeader>
                    <DialogTitle>
                        Add New Student
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john@example.com" {...field}/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Age</FormLabel>
                                    <FormControl>
                                        <Input placeholder="20" {...field}/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="course"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Course</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Computer Science" {...field}/>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <Button type="submit">Save Student</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}