import { CapabilityMeter } from "../CapabilityMeter";

export default function CapabilityMeterExample() {
  return (
    <div className="space-y-4 p-8 bg-background max-w-md">
      <CapabilityMeter value={85} label="Build Credits" max={100} />
      <CapabilityMeter value={12} label="Active Projects" max={20} />
      <CapabilityMeter value={47} label="API Quota" max={100} />
    </div>
  );
}
