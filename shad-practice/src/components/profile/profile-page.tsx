import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2, Edit2, Camera } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function ProfilePage() {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: ""
    });

    // --- MODAL STATES ---
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState<"otp" | "password">("otp");

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isProcessingReset, setIsProcessingReset] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const fetchUser = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch("https://coshts-backend.vercel.app/api/users/getusers", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch user");
        return data;
    };

    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ["users"],
        queryFn: fetchUser,
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

    // Resets the form if the user cancels out of the modal
    const handleCancelProfileEdit = () => {
        setIsProfileModalOpen(false);
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || ""
            });
        }
    };

    const handleUpdateProfile = async () => {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            return toast.error("Names cannot be empty");
        }

        setIsUpdatingProfile(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://coshts-backend.vercel.app/api/users/update-profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim()
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update profile");

            toast.success("Profile updated successfully!");
            setIsProfileModalOpen(false); // Close the modal on success
            queryClient.invalidateQueries({ queryKey: ["users"] });
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleRequestOTP = async () => {
        setIsProcessingReset(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://coshts-backend.vercel.app/api/users/request-password-change", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to send OTP");

            toast.success("OTP sent to your email");

            setModalStep("otp");
            setIsPasswordModalOpen(true);

        } catch (error: any) {
            toast.error(error.message || "Failed to send OTP");
        } finally {
            setIsProcessingReset(false);
        }
    };

    const handleNextStep = () => {
        if (!otp || otp.length < 4) {
            return toast.error("Please enter a valid OTP before proceeding.");
        }
        setModalStep("password");
    };

    const handleFinalReset = async () => {
        if (!otp || !newPassword) return toast.error("Please fill in all fields");

        setIsProcessingReset(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("https://coshts-backend.vercel.app/api/users/verify-password-change", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    otp,
                    newPassword
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Reset failed. Check your OTP.");

            toast.success("Password changed successfully!");

            setIsPasswordModalOpen(false);
            setOtp("");
            setNewPassword("");
            setTimeout(() => setModalStep("otp"), 300);

        } catch (error: any) {
            toast.error(error.message || "Reset failed. Check your OTP.");
        } finally {
            setIsProcessingReset(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            const token = localStorage.getItem("token");
            const uploadData = new FormData();
            uploadData.append("image", file);

            // Note: When sending FormData, do NOT set "Content-Type". 
            // The browser will automatically set it to multipart/form-data with the correct boundary.
            const res = await fetch("https://coshts-backend.vercel.app/api/users/update-profile-picture", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: uploadData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to upload image");

            toast.success("Profile picture updated!");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        } catch (error: any) {
            toast.error(error.message || "Failed to upload image");
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
        }
    };

    const loggedInName = user ? `${user.firstName} ${user.lastName}` : "User";

    return (
        <div className="p-8 w-full space-y-10 text-black">
            <div className="flex flex-col md:flex-row justify-between items-end border-b pb-8 border-slate-200 w-full">
                <h1 className="text-4xl font-bold text-black tracking-tight">COSH Profile Page</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 w-full">
                <div className="lg:col-span-1">
                    <Card className="border-slate-200 shadow-sm py-8 flex flex-col items-center justify-center">
                        <CardHeader className="flex flex-col items-center justify-center w-full space-y-4">

                            {/* --- UPDATED AVATAR CONTAINER --- */}
                            <div
                                onClick={handleAvatarClick}
                                className="relative h-32 w-32 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer group border-2 border-transparent hover:border-slate-300 transition-all"
                            >
                                {isUploadingImage ? (
                                    <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                                ) : user?.profilePictureUrl ? (
                                    <img src={user.profilePictureUrl} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-16 w-16 text-slate-400" />
                                )}

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-8 w-8 text-white mb-1" />
                                    <span className="text-white text-xs font-medium">Upload</span>
                                </div>

                                {/* Hidden Input */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
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
                        <CardHeader className="flex flex-row items-start justify-between w-full pb-2">
                            <div>
                                <CardTitle className="text-2xl text-black">Personal Details</CardTitle>
                                <CardDescription className="text-slate-600 text-base mt-1">
                                    Manage your account names. Note: Email is managed by the system administrator.
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setIsProfileModalOpen(true)}
                                className="border-slate-300 text-black flex items-center gap-2"
                            >
                                <Edit2 className="h-4 w-4" />
                                Edit Name
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-6">

                            {/* READ-ONLY DISPLAY INSTEAD OF INPUTS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-8 border-slate-100">
                                <div className="space-y-1">
                                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">First Name</span>
                                    <p className="text-xl text-black font-medium">{user?.firstName || "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Last Name</span>
                                    <p className="text-xl text-black font-medium">{user?.lastName || "N/A"}</p>
                                </div>

                                {/* --- NEW DISABLED EMAIL FIELD --- */}
                                <div className="space-y-2 md:col-span-2 pt-2">
                                    <Label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Email Address</Label>
                                    <Input
                                        value={user?.email || "Loading..."}
                                        disabled
                                        className="h-12 bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed text-base font-medium"
                                    />
                                    <p className="text-xs text-slate-400">Email addresses are permanently linked to your account and cannot be changed.</p>
                                </div>
                            </div>

                            <div className="space-y-6 pt-2">
                                <h3 className="text-xl font-bold text-black">Security</h3>
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
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* --- NEW PROFILE UPDATE MODAL --- */}
            <Dialog
                open={isProfileModalOpen}
                onOpenChange={(isOpen) => {
                    if (!isOpen) handleCancelProfileEdit();
                    else setIsProfileModalOpen(true);
                }}
            >
                <DialogContent className="sm:max-w-[425px] bg-white text-black border-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Update Name</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Make changes to your account name here.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-3">
                            <Label htmlFor="firstName" className="font-semibold">First Name</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="border-slate-300 h-12"
                                placeholder="Enter first name"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="lastName" className="font-semibold">Last Name</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="border-slate-300 h-12"
                                placeholder="Enter last name"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <div className="flex gap-3 w-full">
                            <Button
                                variant="outline"
                                onClick={handleCancelProfileEdit}
                                className="w-1/3 border-slate-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdateProfile}
                                disabled={isUpdatingProfile}
                                className="bg-black text-white hover:bg-slate-800 w-2/3"
                            >
                                {isUpdatingProfile && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- PASSWORD CHANGE MODAL --- */}
            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white text-black border-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Change Your Password</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            {modalStep === "otp"
                                ? "Check your email for the 6-digit verification code."
                                : "Create a strong, new password for your account."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {modalStep === "otp" ? (
                            <div className="space-y-3">
                                <Label htmlFor="otp" className="font-semibold">Verification Code</Label>
                                <Input
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter OTP"
                                    className="border-slate-300 h-12"
                                />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Label htmlFor="new-password" className="font-semibold">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="border-slate-300 h-12"
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        {modalStep === "otp" ? (
                            <Button
                                onClick={handleNextStep}
                                className="bg-black text-white hover:bg-slate-800 w-full"
                            >
                                Next Step
                            </Button>
                        ) : (
                            <div className="flex gap-3 w-full">
                                <Button
                                    variant="outline"
                                    onClick={() => setModalStep("otp")}
                                    className="w-1/3 border-slate-300"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handleFinalReset}
                                    disabled={isProcessingReset || !newPassword}
                                    className="bg-black text-white hover:bg-slate-800 w-2/3"
                                >
                                    {isProcessingReset && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                    Confirm Update
                                </Button>
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}