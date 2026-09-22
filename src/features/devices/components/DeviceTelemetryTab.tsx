import { TelemetryDetails } from './TelemetryDetails';

interface DeviceTelemetryTabProps {
  deviceId: string;
}

export const DeviceTelemetryTab: React.FC<DeviceTelemetryTabProps> = ({
  deviceId,
}) => {
  return (
    <div className="space-y-4">
      <TelemetryDetails deviceId={deviceId} />
    </div>
  );
};
