import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchData } from "@/lib/api"; //

export default function ProfilePage() {
    const queryClient = useQueryClient();

    // States for form fields
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: ""
    });
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // Loading states
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Fetch User Data
    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ["users"],
        queryFn: () => fetchData("/api/users/getusers"),
    });

    // Sync form data when user data is loaded
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || ""
            });
        }
    }, [user]);

    // Handle Profile Update (Name/Email)
    const handleUpdateProfile = async () => {
        setIsUpdatingProfile(true);
        try {
            await fetchData("/api/users/update-profile", {
                method: "PUT",
                body: JSON.stringify(formData),
            });
            alert("Profile updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        } catch (error: any) {
            alert(error.message || "Failed to update profile");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    // Handle Password Change
    const handlePasswordChange = async () => {
        if (!currentPassword || !newPassword) {
            alert("Please fill in both password fields.");
            return;
        }
        setIsUpdatingPassword(true);
        try {
            await fetchData("/api/users/change-password", {
                method: "POST",
                body: JSON.stringify({
                    email: user?.email,
                    currentPassword,
                    newPassword,
                }),
            });
            alert("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
        } catch (error: any) {
            alert(error.message || "Invalid current password");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const loggedInName = user ? `${user.firstName} ${user.lastName}` : "User";

    console.log(formData.firstName)

    return (
        <div className="p-8 w-full space-y-10 text-black">
            <div className="flex flex-col md:flex-row justify-between items-end border-b pb-8 border-slate-200 w-full">
                <h1 className="text-4xl font-bold text-black tracking-tight">COSH Profile Page</h1>
                <Button
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                    className="bg-black hover:bg-slate-800 text-white px-10 py-6 text-lg"
                >
                    {isUpdatingProfile ? <Loader2 className="mr-2 animate-spin" /> : null}
                    Update Profile
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 w-full">
                <div className="lg:col-span-1">
                    <Card className="border-slate-200 shadow-sm py-8 flex flex-col items-center justify-center">
                        <CardHeader className="flex flex-col items-center justify-center w-full space-y-4">
                            <div className="h-32 w-32 rounded-full bg-slate-100 flex items-center justify-center">
                                <User className="h-16 w-16 text-slate-400" />
                            </div>
                            <div className="text-center space-y-2">
                                <CardTitle className="text-2xl text-black font-bold uppercase tracking-wider leading-none">
                                    {isUserLoading ? "..." : loggedInName}
                                </CardTitle>
                                <Badge variant="outline" className="text-sm py-1 px-4 text-black border-slate-300">
                                    Shop Owner
                                </Badge>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    <Card className="border-slate-200 shadow-sm p-4">
                        <CardHeader>
                            <CardTitle className="text-2xl text-black">Personal Details</CardTitle>
                            <CardDescription className="text-slate-600 text-base">
                                Update your account information for the inventory system.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-b pb-8 border-slate-100">
                                <div className="space-y-3">
                                    <Label className="text-lg font-semibold text-black">First Name</Label>
                                    <Input
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="h-14 border-slate-300 text-black text-lg px-4"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-lg font-semibold text-black">Last Name</Label>
                                    <Input
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="h-14 border-slate-300 text-black text-lg px-4"
                                    />
                                </div>
                                <div className="space-y-3 md:col-span-2">
                                    <Label className="text-lg font-semibold text-black">Contact Email</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="h-14 border-slate-300 text-black text-lg px-4"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6 pt-2">
                                <h3 className="text-xl font-bold text-black">Security</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <Label className="text-lg font-semibold text-black">Current Password</Label>
                                        <Input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="h-14 border-slate-300 px-4"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-lg font-semibold text-black">New Password</Label>
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="h-14 border-slate-300 px-4"
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={handlePasswordChange}
                                    disabled={isUpdatingPassword}
                                    variant="outline"
                                    className="border-black text-black hover:bg-slate-50"
                                >
                                    {isUpdatingPassword ? <Loader2 className="animate-spin" /> : "Change Password"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}