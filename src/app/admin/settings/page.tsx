
'use client';
import withAuth from "@/lib/withAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateSiteSettings } from "@/lib/actions";
import { getSiteSettings } from "@/lib/data-loader";
import type { SiteSettings } from "@/types";
import { useEffect, useState, useTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Trash } from "lucide-react";

function SettingsPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSiteSettings().then(data => {
            setSettings(data);
            setLoading(false);
        });
    }, []);

    const handleFormSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await updateSiteSettings(formData);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                // Optionally re-fetch settings
                const updatedSettings = await getSiteSettings();
                setSettings(updatedSettings);
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    };

    const handleStatChange = (index: number, field: 'value' | 'label', value: string) => {
        if (!settings) return;
        const newStats = [...settings.about.stats];
        newStats[index] = { ...newStats[index], [field]: value };
        setSettings({ ...settings, about: { ...settings.about, stats: newStats } });
    }
    
    const handleMissionVisionChange = (index: number, field: 'title' | 'description', value: string) => {
        if (!settings) return;
        const newItems = [...settings.missionVision];
        newItems[index] = { ...newItems[index], [field]: value };
        setSettings({ ...settings, missionVision: newItems });
    }

    if (loading || !settings) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-1/4" />
                <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
            </div>
        )
    }

  return (
    <form action={handleFormSubmit}>
        <div className="flex items-center justify-between space-y-2 mb-6">
            <h2 className="text-3xl font-bold tracking-tight">Website Settings</h2>
            <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save All Changes'}
            </Button>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>Update your school's name, tagline, and contact information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="siteName">School Name</Label>
                            <Input id="siteName" name="siteName" defaultValue={settings.siteName} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tagline">Tagline / Motto</Label>
                            <Input id="tagline" name="tagline" defaultValue={settings.tagline} />
                        </div>
                    </div>
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" name="phone" defaultValue={settings.phone} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" name="address" defaultValue={settings.address} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Homepage: 'Our Story' Section</CardTitle>
                    <CardDescription>Edit the content for the 'About Us' section on the homepage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="aboutStory">Story / Description</Label>
                        <Textarea id="aboutStory" name="aboutStory" rows={5} defaultValue={settings.about.story} />
                    </div>
                    <div>
                        <Label>Key Statistics</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                            {settings.about.stats.map((stat, index) => (
                                <div key={index} className="p-4 border rounded-lg space-y-2">
                                     <Label htmlFor={`stat-value-${index}`}>Value</Label>
                                     <Input 
                                        id={`stat-value-${index}`}
                                        name={`stat_value_${index}`}
                                        value={stat.value}
                                        onChange={e => handleStatChange(index, 'value', e.target.value)}
                                     />
                                     <Label htmlFor={`stat-label-${index}`}>Label</Label>
                                     <Input 
                                        id={`stat-label-${index}`}
                                        name={`stat_label_${index}`}
                                        value={stat.label}
                                         onChange={e => handleStatChange(index, 'label', e.target.value)}
                                     />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Mission, Vision & Values</CardTitle>
                    <CardDescription>Edit the mission, vision, and values displayed on the 'About Us' page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {settings.missionVision.map((item, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-2">
                            <Label htmlFor={`mv-title-${index}`}>Title</Label>
                            <Input 
                                id={`mv-title-${index}`}
                                name={`mv_title_${index}`}
                                value={item.title}
                                onChange={e => handleMissionVisionChange(index, 'title', e.target.value)}
                            />
                            <Label htmlFor={`mv-description-${index}`}>Description</Label>
                             <Textarea
                                id={`mv-description-${index}`}
                                name={`mv_description_${index}`}
                                value={item.description}
                                onChange={e => handleMissionVisionChange(index, 'description', e.target.value)}
                                rows={3}
                             />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    </form>
  );
}

export default withAuth(SettingsPage);
