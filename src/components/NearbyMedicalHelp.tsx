import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Navigation, Star, Loader2, X, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MedicalPlace {
  name: string;
  address: string;
  rating?: number;
  location: {
    lat: number;
    lng: number;
  };
  place_id: string;
  types: string[];
  is_open?: boolean;
}

interface NearbyMedicalHelpProps {
  severity: string;
  onClose?: () => void;
}

const NearbyMedicalHelp = ({ severity, onClose }: NearbyMedicalHelpProps) => {
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<MedicalPlace[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchType, setSearchType] = useState<string>("");
  const [locationError, setLocationError] = useState<string>("");
  const [permissionState, setPermissionState] = useState<string>("prompt");
  const { toast } = useToast();

  // Check location permission on mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    if (!navigator.permissions) return;
    
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionState(result.state);
      
      result.addEventListener('change', () => {
        setPermissionState(result.state);
      });
    } catch (error) {
      console.log('Permissions API not supported');
    }
  };

  const findNearbyHelp = () => {
    setLoading(true);
    setLocationError("");

    if (!navigator.geolocation) {
      const error = "Your browser doesn't support geolocation. Please use a modern browser like Chrome, Firefox, or Edge.";
      setLocationError(error);
      toast({
        title: "Location Not Supported",
        description: error,
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    // Request location with timeout
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      handleLocationSuccess,
      handleLocationError,
      options
    );
  };

  const handleLocationSuccess = async (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords;
    setUserLocation({ lat: latitude, lng: longitude });
    setLocationError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/nearby_medical_help", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat: latitude,
          lng: longitude,
          severity: severity
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch nearby medical facilities");
      }

      const data = await response.json();
      console.log("Nearby places:", data);

      setPlaces(data.results || []);
      setSearchType(data.search_type || "medical facilities");

      toast({
        title: "✓ Found Nearby Facilities",
        description: `Found ${data.results?.length || 0} ${data.search_type} near you`,
      });
    } catch (error) {
      console.error("Error fetching nearby help:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to find nearby medical facilities";
      setLocationError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationError = (error: GeolocationPositionError) => {
    setLoading(false);
    let errorMessage = "Unable to get your location. ";
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage += "Location permission was denied. Please enable location access in your browser settings and try again.";
        setPermissionState("denied");
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage += "Location information is unavailable. Please check your device's location settings.";
        break;
      case error.TIMEOUT:
        errorMessage += "Location request timed out. Please try again.";
        break;
      default:
        errorMessage += "An unknown error occurred.";
    }

    setLocationError(errorMessage);
    toast({
      title: "Location Error",
      description: errorMessage,
      variant: "destructive"
    });
  };

  const openDirections = (place: MedicalPlace) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${place.location.lat},${place.location.lng}&travelmode=driving`;
      window.open(url, "_blank");
    }
  };

  const openInMaps = (place: MedicalPlace) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;
    window.open(url, "_blank");
  };

  const getSeverityColor = () => {
    if (severity === "emergency") return "bg-red-100 border-red-300";
    if (severity === "urgent") return "bg-orange-100 border-orange-300";
    return "bg-blue-100 border-blue-300";
  };

  const getSeverityText = () => {
    if (severity === "emergency") return "🚨 Emergency Hospitals Nearby";
    if (severity === "urgent") return "⚠️ Urgent Care Facilities";
    return "🏥 Medical Clinics & Doctors";
  };

  const openBrowserSettings = () => {
    toast({
      title: "Enable Location Access",
      description: "Look for the location icon in your browser's address bar and click 'Allow'",
      duration: 5000,
    });
  };

  return (
    <Card className={`${getSeverityColor()} border-2`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {getSeverityText()}
            </CardTitle>
            <CardDescription className="mt-2">
              {severity === "emergency"
                ? "Find the nearest emergency hospitals for immediate care"
                : "Find nearby medical clinics and doctors for consultation"}
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location Error Alert */}
        {locationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {locationError}
              {permissionState === "denied" && (
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={openBrowserSettings}
                  >
                    How to Enable Location
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Action Button */}
        {!places.length && (
          <Button
            onClick={findNearbyHelp}
            disabled={loading}
            className="w-full"
            size="lg"
            variant={severity === "emergency" ? "destructive" : "default"}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Finding Nearby Facilities...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                {permissionState === "denied" 
                  ? "Location Access Denied - Try Again"
                  : `Find Nearby ${severity === "emergency" ? "Hospitals" : "Clinics"}`
                }
              </>
            )}
          </Button>
        )}

        {/* Results List */}
        {places.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">
                Found {places.length} {searchType}
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={findNearbyHelp}
                disabled={loading}
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {places.map((place, index) => (
                <Card key={place.place_id || index} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h5 className="font-semibold text-sm">{place.name}</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          {place.address}
                        </p>
                      </div>
                      {place.is_open !== undefined && (
                        <Badge
                          variant={place.is_open ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {place.is_open ? "Open Now" : "Closed"}
                        </Badge>
                      )}
                    </div>

                    {place.rating && (
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{place.rating}</span>
                        <span className="text-muted-foreground">/ 5.0</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1"
                        onClick={() => openDirections(place)}
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Directions
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openInMaps(place)}
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <p className="font-medium mb-1">📍 How to Enable Location:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Look for the location icon 🌐 in your browser's address bar</li>
            <li>Click on it and select "Allow" or "Always allow"</li>
            <li>If blocked, go to browser Settings → Privacy → Site Settings → Location</li>
            <li>Add this site to allowed list</li>
          </ol>
          <p className="mt-2 text-xs">
            ℹ️ Your location is only used to find nearby medical facilities and is not stored.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NearbyMedicalHelp;