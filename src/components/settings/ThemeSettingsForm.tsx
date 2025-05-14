
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, Monitor } from "lucide-react";

const themeSettingsSchema = z.object({
  colorScheme: z.enum(["light", "dark", "system"]),
  reducedMotion: z.boolean(),
  largeText: z.boolean(),
  highContrast: z.boolean(),
  compactView: z.boolean(),
  sidebarCollapsed: z.boolean(),
});

export type ThemeSettings = z.infer<typeof themeSettingsSchema>;

interface ThemeSettingsFormProps {
  onSave: (data: ThemeSettings) => void;
  isSaving: boolean;
}

const ThemeSettingsForm: React.FC<ThemeSettingsFormProps> = ({
  onSave,
  isSaving,
}) => {
  // Load theme settings from localStorage or use defaults
  const loadThemeSettings = (): ThemeSettings => {
    try {
      const stored = localStorage.getItem("tellerpos_theme_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          colorScheme: parsed.colorScheme || "system",
          reducedMotion: parsed.reducedMotion || false,
          largeText: parsed.largeText || false,
          highContrast: parsed.highContrast || false,
          compactView: parsed.compactView || false,
          sidebarCollapsed: parsed.sidebarCollapsed || false,
        };
      }
    } catch (error) {
      console.error("Error loading theme settings:", error);
    }
    
    // Default values
    return {
      colorScheme: "system",
      reducedMotion: false,
      largeText: false,
      highContrast: false,
      compactView: false,
      sidebarCollapsed: false,
    };
  };
  
  const form = useForm<ThemeSettings>({
    resolver: zodResolver(themeSettingsSchema),
    defaultValues: loadThemeSettings(),
  });

  // Apply theme settings when form values change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "colorScheme") {
        applyColorScheme(value.colorScheme as "light" | "dark" | "system");
      }
      
      if (name === "largeText") {
        document.documentElement.classList.toggle("text-large", !!value.largeText);
      }
      
      if (name === "highContrast") {
        document.documentElement.classList.toggle("high-contrast", !!value.highContrast);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);
  
  // Apply color scheme based on selection
  const applyColorScheme = (scheme: "light" | "dark" | "system") => {
    if (scheme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (scheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      // System preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  };

  const onSubmit = (data: ThemeSettings) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Theme & Display Settings</CardTitle>
            <CardDescription>
              Customize the appearance of your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Appearance</h3>
              
              <FormField
                control={form.control}
                name="colorScheme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Scheme</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select color scheme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="light" className="flex items-center">
                          <div className="flex items-center">
                            <Sun className="h-4 w-4 mr-2" />
                            <span>Light</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center">
                            <Moon className="h-4 w-4 mr-2" />
                            <span>Dark</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center">
                            <Monitor className="h-4 w-4 mr-2" />
                            <span>System</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose your preferred color scheme
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="highContrast"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        High Contrast
                      </FormLabel>
                      <FormDescription>
                        Increase contrast for better visibility
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Accessibility</h3>
              
              <FormField
                control={form.control}
                name="largeText"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Large Text
                      </FormLabel>
                      <FormDescription>
                        Increase text size throughout the app
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reducedMotion"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Reduced Motion
                      </FormLabel>
                      <FormDescription>
                        Minimize animations and transitions
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Layout</h3>
              
              <FormField
                control={form.control}
                name="compactView"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Compact View
                      </FormLabel>
                      <FormDescription>
                        Reduce padding and margins in the interface
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sidebarCollapsed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Default Collapsed Sidebar
                      </FormLabel>
                      <FormDescription>
                        Start with the sidebar collapsed when loading the app
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Theme Settings"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

export default ThemeSettingsForm;
