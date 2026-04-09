import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchData } from "@/lib/api";

export default function ProfilePage() {
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: ""
    });

    const [resetStep, setResetStep] = useState<"idle" | "verify">("idle");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isProcessingReset, setIsProcessingReset] = useState(false);

    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ["users"],
        queryFn: () => fetchData("/api/users/getusers"),
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || ""
            });
        }
    }, [user]);

    const handleUpdateProfile = async () => {
        setIsUpdatingProfile(true);
        try {
            await fetchData("/api/users/update-profile", {
                method: "PUT",
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName
                }),
            });
            alert("Profile updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        } catch (error: any) {
            alert(error.message || "Failed to update profile");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleRequestOTP = async () => {
        setIsProcessingReset(true);
        try {
            // Changed URL to the new secure route. 
            // We removed the body payload because the backend already knows the user's email from the token!
            await fetchData("/api/users/request-password-change", {
                method: "POST"
            });
            alert(`OTP sent to your email`);
            setResetStep("verify");
        } catch (error: any) {
            alert(error.message || "Failed to send OTP");
        } finally {
            setIsProcessingReset(false);
        }
    };

    const handleFinalReset = async () => {
        if (!otp || !newPassword) return alert("Please fill in all fields");

        setIsProcessingReset(true);
        try {
            // Changed URL to the new secure route.
            // Removed email from the payload, again, because the backend gets it from the token.
            await fetchData("/api/users/verify-password-change", {
                method: "POST",
                body: JSON.stringify({
                    otp,
                    newPassword
                }),
            });
            alert("Password changed successfully!");
            setResetStep("idle");
            setOtp("");
            setNewPassword("");
        } catch (error: any) {
            alert(error.message || "Reset failed. Check your OTP.");
        } finally {
            setIsProcessingReset(false);
        }
    };

    const loggedInName = user ? `${user.firstName} ${user.lastName}` : "User";

    return (
        <div className="p-8 w-full space-y-10 text-black">
            <div className="flex flex-col md:flex-row justify-between items-end border-b pb-8 border-slate-200 w-full">
                <h1 className="text-4xl font-bold text-black tracking-tight">COSH Profile Page</h1>
                <Button
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile || isUserLoading}
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
                                Manage your account names. Note: Email is managed by the system administrator.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-b pb-8 border-slate-100">
                                <div className="space-y-3">
                                    <span className="text-lg font-semibold text-black">First Name</span>
                                    <Input
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="h-14 border-slate-300 text-black text-lg px-4"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <span className="text-lg font-semibold text-black">Last Name</span>
                                    <Input
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="h-14 border-slate-300 text-black text-lg px-4"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6 pt-2">
                                <h3 className="text-xl font-bold text-black">Security</h3>

                                {resetStep === "idle" ? (
                                    <div className="space-y-4">
                                        <p className="text-slate-600">
                                            To change your password, we need to verify your identity via email.
                                        </p>
                                        <Button
                                            onClick={handleRequestOTP}
                                            disabled={isProcessingReset || isUserLoading}
                                            variant="outline"
                                            className="border-black text-black hover:bg-slate-50 flex items-center gap-2 h-12"
                                        >
                                            {isProcessingReset && <Loader2 className="animate-spin h-5 w-5" />}
                                            Change Password
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6 p-6 bg-slate-50 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-black font-semibold">Verification Code</Label>
                                                <Input
                                                    placeholder="Enter 6-digit OTP"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    className="bg-white border-slate-300"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-black font-semibold">New Password</Label>
                                                <Input
                                                    type="password"
                                                    placeholder="Create new password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="bg-white border-slate-300"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <Button
                                                onClick={handleFinalReset}
                                                disabled={isProcessingReset}
                                                className="bg-black text-white hover:bg-slate-800"
                                            >
                                                {isProcessingReset && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                                Confirm Change
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setResetStep("idle")}
                                                className="text-slate-500"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}