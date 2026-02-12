"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiopterCalculator } from "@/components/calculators/diopter-calculator";
import { FoVCalculator } from "@/components/calculators/fov-calculator";
import { Focus, Video } from "lucide-react";

export default function Home() {
  return (
    <Tabs defaultValue="diopter" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="diopter" className="gap-1.5">
          <Focus className="h-4 w-4" />
          Diopter Focus Range
        </TabsTrigger>
        <TabsTrigger value="fov" className="gap-1.5">
          <Video className="h-4 w-4" />
          FoV Calculator
        </TabsTrigger>
      </TabsList>
      <TabsContent value="diopter" className="mt-4">
        <DiopterCalculator />
      </TabsContent>
      <TabsContent value="fov" className="mt-4">
        <FoVCalculator />
      </TabsContent>
    </Tabs>
  );
}
