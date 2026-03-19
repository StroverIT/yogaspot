import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { YOGA_TYPES } from '@/data/yoga-types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';

type StudioModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function StudioModal({
  open,
  onClose,
  onSave,
}: StudioModalProps) {
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [amenities, setAmenities] = useState({
    parking: false,
    shower: false,
    changingRoom: false,
    equipmentRental: false,
  });
  const [selectedYogaTypes, setSelectedYogaTypes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const [addressPredictions, setAddressPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);
  const skipNextAddressGeocodeRef = useRef(false);
  const suppressAutocompleteRef = useRef(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places'],
  });

  const mapCenter = useMemo(() => coords ?? { lat: 42.6977, lng: 23.3219 }, [coords]);
  const imagePreviews = useMemo(
    () =>
      images.map((file) => ({
        key: `${file.name}-${file.lastModified}`,
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [images],
  );

  useEffect(() => {
    if (!open) return;
    // Reset transient errors when reopening.
    setAddressError(null);
    setSubmitting(false);
    setName('');
    setDescription('');
    setPhone('');
    setEmail('');
    setAmenities({ parking: false, shower: false, changingRoom: false, equipmentRental: false });
    setSelectedYogaTypes([]);
    setCoords(null);
    setAddress('');
    setAddressDropdownOpen(false);
    setAddressPredictions([]);
    setImages([]);
  }, [open]);

  useEffect(() => {
    if (skipNextAddressGeocodeRef.current) {
      skipNextAddressGeocodeRef.current = false;
      return;
    }

    if (!address.trim()) {
      setCoords(null);
      setAddressError(null);
      setAddressPredictions([]);
      setAddressDropdownOpen(false);
      return;
    }

    if (!apiKey) {
      setCoords(null);
      setAddressError('Липсва Google Maps API ключ (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).');
      setAddressPredictions([]);
      setAddressDropdownOpen(false);
      return;
    }

    const handle = window.setTimeout(() => {
      if (!window.google?.maps?.Geocoder) return;

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { address: address.trim(), componentRestrictions: { country: 'bg' } },
        (results, status) => {
        if (status !== 'OK' || !results?.[0]?.geometry?.location) {
          setCoords(null);
          setAddressError('Адресът не е намерен. Опитайте по-точен адрес.');
          return;
        }

        const location = results[0].geometry.location;
        setCoords({ lat: location.lat(), lng: location.lng() });
        setAddressError(null);
        },
      );
    }, 500);

    return () => window.clearTimeout(handle);
  }, [address, apiKey]);

  const reverseGeocode = (lat: number, lng: number) => {
    if (!window.google?.maps?.Geocoder) return;

    skipNextAddressGeocodeRef.current = true; // Avoid immediately geocoding `address` again from our reverse result.
    suppressAutocompleteRef.current = true; // We don't want dropdown to pop up after pin.
    const geocoder = new window.google.maps.Geocoder();

    const hasSpecificType = (types?: string[]) => {
      if (!types?.length) return false;
      return types.some(t =>
        [
          'street_address',
          'route',
          'premise',
          'subpremise',
          'street_number',
          'point_of_interest',
          'establishment',
          'postal_code',
          'neighborhood',
          'locality',
          'administrative_area_level_2',
        ].includes(t),
      );
    };

    const pickBest = (results: google.maps.GeocoderResult[]) => {
      // Prefer street/premise-level responses; fall back to first.
      return (
        results.find(r => hasSpecificType(r.types)) ??
        results.find(r => hasSpecificType(r.types?.slice?.(0, 10))) ??
        results[0]
      );
    };

    const run = (opts: google.maps.GeocoderRequest) => {
      geocoder.geocode(opts, (results, status) => {
        if (status !== 'OK' || !results?.length) return;

        const best = pickBest(results);
        const bestTypes = best?.types ?? [];
        const isOnlyCountryLevel =
          bestTypes.length === 1 && bestTypes[0] === 'country' || (!hasSpecificType(bestTypes) && bestTypes.includes('country'));

        if (opts.componentRestrictions?.country === 'bg' && isOnlyCountryLevel) {
          // Sometimes bg-restricted reverse geocoding yields only the country.
          // Retry without restriction for more specific results.
          run({ location: { lat, lng } });
          return;
        }

        setAddress(best?.formatted_address ?? address);
        setAddressError(null);
        setAddressDropdownOpen(false);
        setAddressPredictions([]);
      });
    };

    run({ location: { lat, lng }, componentRestrictions: { country: 'bg' } });
  };

  useEffect(() => {
    if (!open) return;
    if (!address.trim()) return;
    if (!isLoaded) return;
    if (!apiKey) return;
    if (!window.google?.maps?.places?.AutocompleteService) return;

    if (suppressAutocompleteRef.current) {
      suppressAutocompleteRef.current = false;
      setAddressDropdownOpen(false);
      setAddressPredictions([]);
      return;
    }

    const handle = window.setTimeout(() => {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input: address.trim(),
          types: ['geocode', 'establishment'],
          componentRestrictions: { country: 'bg' },
        },
        (predictions, status) => {
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions?.length) {
            setAddressPredictions([]);
            setAddressDropdownOpen(false);
            return;
          }
          setAddressPredictions(predictions);
          setAddressDropdownOpen(true);
        },
      );
    }, 250);

    return () => window.clearTimeout(handle);
  }, [address, apiKey, isLoaded, open]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [imagePreviews]);

  const handleSave = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('address', address);
      formData.append('description', description);
      formData.append('phone', phone);
      formData.append('email', email);
      if (coords) {
        formData.append('lat', String(coords.lat));
        formData.append('lng', String(coords.lng));
      }

      formData.append('amenitiesParking', String(amenities.parking));
      formData.append('amenitiesShower', String(amenities.shower));
      formData.append('amenitiesChangingRoom', String(amenities.changingRoom));
      formData.append('amenitiesEquipmentRental', String(amenities.equipmentRental));

      for (const t of selectedYogaTypes) {
        formData.append('yogaTypes', t);
      }

      for (const file of images) {
        formData.append('images', file);
      }

      const res = await fetch('/api/studios', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Failed to save studio (${res.status})`);
      }

      toast({
        title: 'Успех',
        description: 'Студиото беше запазено успешно.',
      });
      onSave();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Неуспешно запазване на студио.';
      toast({
        variant: 'destructive',
        title: 'Грешка',
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Студио</DialogTitle>
          <DialogDescription>Добавете или редактирайте информацията за вашето студио</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>Име на студио</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="напр. Лотос Йога Студио"
              className="mt-1"
            />
          </div>
          <div className="space-y-2">
            <div>
              <Label>Адрес</Label>
              <div className="relative mt-1">
                <Input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  onFocus={() => {
                    if (addressPredictions.length) setAddressDropdownOpen(true);
                  }}
                  onBlur={() => {
                    // Let option clicks register before closing.
                    window.setTimeout(() => setAddressDropdownOpen(false), 150);
                  }}
                  placeholder="ул. Витоша 45, София"
                />

                {addressDropdownOpen && addressPredictions.length ? (
                  <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-lg">
                    <ul className="max-h-64 overflow-auto py-1">
                      {addressPredictions.slice(0, 8).map((p) => (
                        <li key={p.place_id}>
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted/60"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              suppressAutocompleteRef.current = true;
                              skipNextAddressGeocodeRef.current = true;
                              setAddress(p.description);
                              setAddressDropdownOpen(false);
                              setAddressPredictions([]);

                              if (!window.google?.maps?.Geocoder) return;
                              const geocoder = new window.google.maps.Geocoder();
                              geocoder.geocode({ placeId: p.place_id }, (results, status) => {
                                if (status !== 'OK' || !results?.[0]?.geometry?.location) return;
                                const location = results[0].geometry.location;
                                setCoords({ lat: location.lat(), lng: location.lng() });
                                setAddressError(null);
                              });
                            }}
                          >
                            <div className="font-medium">{p.structured_formatting.main_text}</div>
                            <div className="text-xs text-muted-foreground">{p.structured_formatting.secondary_text}</div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-border overflow-hidden bg-muted/20">
              {!apiKey ? (
                <div className="p-3 text-sm text-muted-foreground">
                  За да се визуализира карта, добавете `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
                </div>
              ) : !isLoaded ? (
                <div className="p-3 text-sm text-muted-foreground">Зареждане на карта…</div>
              ) : (
                <div className="h-56 w-full">
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={mapCenter}
                    zoom={coords ? 16 : 12}
                    onClick={(e) => {
                      const lat = e.latLng?.lat();
                      const lng = e.latLng?.lng();
                      if (lat == null || lng == null) return;
                      const next = { lat, lng };
                      setCoords(next);
                      setAddressError(null);
                      reverseGeocode(lat, lng);
                    }}
                    options={{
                      mapTypeControl: false,
                      streetViewControl: false,
                      fullscreenControl: false,
                    }}
                  >
                    {coords ? (
                      <MarkerF
                        position={coords}
                        draggable
                        onDragEnd={(e) => {
                          const lat = e.latLng?.lat();
                          const lng = e.latLng?.lng();
                          if (lat == null || lng == null) return;
                          const next = { lat, lng };
                          setCoords(next);
                          setAddressError(null);
                          reverseGeocode(lat, lng);
                        }}
                      />
                    ) : null}
                  </GoogleMap>
                </div>
              )}
            </div>

            {addressError ? <p className="text-sm text-destructive">{addressError}</p> : null}
          </div>
          <div>
            <Label>Описание</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Опишете вашето студио..."
              className="mt-1"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Снимки</Label>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={e => {
                const next = Array.from(e.target.files ?? []);
                setImages(next);
              }}
            />
            {images.length ? (
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((p) => (
                  <div key={p.key} className="relative overflow-hidden rounded-lg border border-border bg-muted/20">
                    <img src={p.url} alt={p.name} className="h-24 w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Можете да изберете повече от 1 снимка.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Телефон</Label>
              <Input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+359 ..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Имейл</Label>
              <Input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                placeholder="info@studio.bg"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Удобства</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'parking', label: '🅿️ Паркинг' },
                { key: 'shower', label: '🚿 Душ' },
                { key: 'changingRoom', label: '👔 Съблекалня' },
                { key: 'equipmentRental', label: '🧘 Наем на оборудване' },
              ].map(a => (
                <div key={a.key} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm">{a.label}</span>
                  <Switch
                    checked={amenities[a.key as keyof typeof amenities]}
                    onCheckedChange={(v) => {
                      const key = a.key as keyof typeof amenities;
                      setAmenities(prev => ({ ...prev, [key]: v }));
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Типове йога</Label>
            <p className="text-xs text-muted-foreground -mt-1 mb-3">
              Изберете всички стилове които практикувате
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {YOGA_TYPES.map((t) => {
                const selected = selectedYogaTypes.includes(t.name);
                return (
                  <Button
                    key={t.name}
                    type="button"
                    variant="outline"
                    className={cn(
                      'justify-start w-full h-auto py-2 px-3',
                      selected
                        ? 'border-accent bg-accent/10 text-accent hover:bg-accent/10'
                        : '',
                    )}
                    onClick={() => {
                      setSelectedYogaTypes((prev) =>
                        selected ? prev.filter((x) => x !== t.name) : [...prev, t.name],
                      );
                    }}
                  >
                    <div className="min-w-0 text-left">
                      <div className="truncate text-sm font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{t.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Отказ</Button>
          <Button onClick={handleSave} disabled={submitting}>
            {submitting ? 'Запазване...' : 'Запази'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

