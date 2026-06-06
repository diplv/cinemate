"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiopterCalculator } from "@/components/calculators/diopter-calculator";
import { FoVCalculator } from "@/components/calculators/fov-calculator";
import { MediaCapacityCalculator } from "@/components/calculators/media-capacity-calculator";
import { LutConverter } from "@/components/calculators/lut-converter";
import { DamageReport } from "@/components/calculators/damage-report";
import { Focus, Video, HardDrive, Palette, FileWarning } from "lucide-react";

export default function Home() {
  return (
    <Tabs defaultValue="diopter" className="w-full">
      <TabsList
        className="w-full p-1"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "0.25rem",
          height: "auto",
        }}
      >
        <TabsTrigger value="diopter" className="gap-1.5">
          <Focus className="h-4 w-4" />
          Diopter
        </TabsTrigger>
        <TabsTrigger value="fov" className="gap-1.5">
          <Video className="h-4 w-4" />
          FoV
        </TabsTrigger>
        <TabsTrigger value="media" className="gap-1.5">
          <HardDrive className="h-4 w-4" />
          Media
        </TabsTrigger>
        <TabsTrigger value="lut" className="gap-1.5">
          <Palette className="h-4 w-4" />
          ARRI Look
        </TabsTrigger>
        <TabsTrigger value="damage" className="gap-1.5">
          <FileWarning className="h-4 w-4" />
          Damage
        </TabsTrigger>
      </TabsList>
      <TabsContent value="diopter" className="mt-4">
        <DiopterCalculator />
      </TabsContent>
      <TabsContent value="fov" className="mt-4">
        <FoVCalculator />
      </TabsContent>
      <TabsContent value="media" className="mt-4">
        <MediaCapacityCalculator />
      </TabsContent>
      <TabsContent value="lut" className="mt-4">
        <LutConverter />
      </TabsContent>
      <TabsContent value="damage" className="mt-4">
        <DamageReport />
      </TabsContent>
    </Tabs>
  );
}
