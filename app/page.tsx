"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiopterCalculator } from "@/components/calculators/diopter-calculator";
import { FoVCalculator } from "@/components/calculators/fov-calculator";
import { MediaCapacityCalculator } from "@/components/calculators/media-capacity-calculator";
import { Focus, Video, HardDrive } from "lucide-react";

export default function Home() {
  return (
    <Tabs defaultValue="diopter" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
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
    </Tabs>
  );
}
