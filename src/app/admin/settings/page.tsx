
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
import Image from "next/image";

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
            // Need to append the complex state objects manually
            if (settings?.about?.stats) {
                formData.append('about_stats', JSON.stringify(settings.about.stats));
            }
            if (settings?.missionVision) {
                formData.append('missionVision', JSON.stringify(settings.missionVision));
            }

            const result = await updateSiteSettings(formData);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                const updatedSettings = await getSiteSettings();
                setSettings(updatedSettings);
            } else {
                toast({ title: "Error", description: result.message, variant: "destructive" });
            }
        });
    };

    const handleStatChange = (index: number, field: 'value' | 'label', value: string) => {
        if (!settings) return;
        const newStats = [...(settings.about?.stats || [])];
        newStats[index] = { ...newStats[index], [field]: value };
        setSettings({ ...settings, about: { ...settings.about!, stats: newStats } });
    }
    
    const handleMissionVisionChange = (index: number, field: 'title' | 'description' | 'icon', value: string) => {
        if (!settings) return;
        const newItems = [...(settings.missionVision || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        setSettings({ ...settings, missionVision: newItems });
    }

    const addMissionVisionItem = () => {
        if (!settings) return;
        const newItems = [...(settings.missionVision || []), { title: '', description: '', icon: 'Default' }];
        setSettings({ ...settings, missionVision: newItems });
    }

    const removeMissionVisionItem = (index: number) => {
        if (!settings) return;
        const newItems = [...(settings.missionVision || [])];
        newItems.splice(index, 1);
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
                        <Textarea id="aboutStory" name="aboutStory" rows={5} defaultValue={settings.about?.story} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="aboutImage">Image File</Label>
                        <Input id="aboutImage" name="aboutImage" type="file" accept="image/*" />
                         {settings.about?.imageUrl && (
                            <div className="mt-4">
                                <p className="text-sm text-muted-foreground mb-2">Current Image:</p>
                                <Image src={settings.about.imageUrl} alt="Current About Image" width={200} height={200} className="rounded-md object-cover"/>
                            </div>
                        )}
                    </div>
                    <div>
                        <Label>Key Statistics</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                            {settings.about?.stats?.map((stat, index) => (
                                <div key={index} className="p-4 border rounded-lg space-y-2">
                                     <Label htmlFor={`stat_value_${index}`}>Value</Label>
                                     <Input 
                                        id={`stat_value_${index}`}
                                        name={`stat_value_${index}`}
                                        value={stat.value}
                                        onChange={e => handleStatChange(index, 'value', e.target.value)}
                                     />
                                     <Label htmlFor={`stat_label_${index}`}>Label</Label>
                                     <Input 
                                        id={`stat_label_${index}`}
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
                 <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Mission, Vision & Values</CardTitle>
                        <CardDescription>Edit the mission, vision, and values displayed on the 'About Us' page.</CardDescription>
                    </div>
                    <Button type="button" variant="outline" onClick={addMissionVisionItem}>
                        <PlusCircle className="mr-2" />
                        Add Item
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {settings.missionVision?.map((item, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                            <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => removeMissionVisionItem(index)}>
                                <Trash className="h-4 w-4" />
                            </Button>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`mv_title_${index}`}>Title</Label>
                                    <Input 
                                        id={`mv_title_${index}`}
                                        name={`mv_title_${index}`}
                                        value={item.title}
                                        onChange={e => handleMissionVisionChange(index, 'title', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`mv_icon_${index}`}>Icon</Label>
                                    <Input 
                                        id={`mv_icon_${index}`}
                                        name={`mv_icon_${index}`}
                                        value={item.icon}
                                        onChange={e => handleMissionVisionChange(index, 'icon', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`mv_description_${index}`}>Description</Label>
                                 <Textarea
                                    id={`mv_description_${index}`}
                                    name={`mv_description_${index}`}
                                    value={item.description}
                                    onChange={e => handleMissionVisionChange(index, 'description', e.target.value)}
                                    rows={3}
                                 />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    </form>
  );
}

export default withAuth(SettingsPage);
