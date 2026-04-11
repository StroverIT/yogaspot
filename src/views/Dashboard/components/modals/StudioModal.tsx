import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  YOGA_CATALOG_NAME_SET,
  YOGA_TYPE_CATEGORY_ORDER,
  YOGA_TYPES,
  type YogaTypeCatalogEntry,
} from '@/data/yoga-types';
import { useToast } from '@/hooks/use-toast';
import type { DashboardStudioListItem } from '@/lib/dashboard-studios-data';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { Check, ChevronLeft, ChevronRight, GripVertical, X } from 'lucide-react';

type StudioModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  /** When set, the form opens in edit mode with these values (and saves via PATCH). */
  initialStudio?: DashboardStudioListItem | null;
};

type StudioImageUrlSlot = { kind: 'url'; id: string; url: string };
type StudioImageFileSlot = { kind: 'file'; id: string; file: File; previewUrl: string };
type StudioImageSlot = StudioImageUrlSlot | StudioImageFileSlot;

const NEW_IMAGE_SLOT_MARKER = '__NEW__';
const DRAG_MIME = 'application/x-zenno-studio-image-index';

export function StudioModal({
  open,
  onClose,
  onSave,
  initialStudio = null,
}: StudioModalProps) {
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [imageSlots, setImageSlots] = useState<StudioImageSlot[]>([]);
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
  const [yogaTypesQuery, setYogaTypesQuery] = useState('');
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

  const displayedTypesForSearch = useMemo((): YogaTypeCatalogEntry[] | null => {
    const q = yogaTypesQuery.trim().toLowerCase();
    if (!q) return null;

    const catLabels = new Map(YOGA_TYPE_CATEGORY_ORDER.map(c => [c.id, c.label.toLowerCase()]));
    const matches = (t: YogaTypeCatalogEntry) => {
      const catLower = catLabels.get(t.category) ?? '';
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        catLower.includes(q)
      );
    };

    return YOGA_TYPES.filter(matches);
  }, [yogaTypesQuery]);

  const legacySelectedYogaTypes = useMemo(
    () => selectedYogaTypes.filter(n => !YOGA_CATALOG_NAME_SET.has(n)),
    [selectedYogaTypes],
  );

  useEffect(() => {
    if (!open) return;
    setYogaTypesQuery('');
    setAddressError(null);
    setSubmitting(false);
    setAddressDropdownOpen(false);
    setAddressPredictions([]);

    setImageSlots(prev => {
      prev.forEach(s => {
        if (s.kind === 'file') URL.revokeObjectURL(s.previewUrl);
      });
      if (initialStudio) {
        return (initialStudio.images ?? []).map(url => ({
          kind: 'url' as const,
          id: crypto.randomUUID(),
          url,
        }));
      }
      return [];
    });

    if (initialStudio) {
      skipNextAddressGeocodeRef.current = true;
      suppressAutocompleteRef.current = true;
      setName(initialStudio.name);
      setDescription(initialStudio.description);
      setPhone(initialStudio.phone);
      setEmail(initialStudio.email);
      setAmenities({
        parking: initialStudio.amenities.parking,
        shower: initialStudio.amenities.shower,
        changingRoom: initialStudio.amenities.changingRoom,
        equipmentRental: initialStudio.amenities.equipmentRental,
      });
      setSelectedYogaTypes([...(initialStudio.yogaTypes ?? [])]);
      setAddress(initialStudio.address);
      const { lat, lng } = initialStudio;
      if (lat != null && lng != null && (lat !== 0 || lng !== 0)) {
        setCoords({ lat, lng });
      } else {
        setCoords(null);
      }
      return;
    }

    setName('');
    setDescription('');
    setPhone('');
    setEmail('');
    setAmenities({ parking: false, shower: false, changingRoom: false, equipmentRental: false });
    setSelectedYogaTypes([]);
    setCoords(null);
    setAddress('');
  }, [open, initialStudio]);

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

  const removeImageSlot = useCallback((slotId: string) => {
    setImageSlots(prev => {
      const slot = prev.find(s => s.id === slotId);
      if (slot?.kind === 'file') {
        URL.revokeObjectURL(slot.previewUrl);
      }
      return prev.filter(s => s.id !== slotId);
    });
  }, []);

  const moveImageSlot = useCallback((index: number, delta: -1 | 1) => {
    setImageSlots(prev => {
      const j = index + delta;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }, []);

  const onSlotDragStart = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.dataTransfer.setData(DRAG_MIME, String(index));
      e.dataTransfer.effectAllowed = 'move';
    },
    [],
  );

  const onSlotDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onSlotDrop = useCallback(
    (targetIndex: number) => (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData(DRAG_MIME);
      const from = Number(raw);
      if (Number.isNaN(from) || from === targetIndex) return;
      setImageSlots(prev => {
        const next = [...prev];
        const [item] = next.splice(from, 1);
        next.splice(targetIndex, 0, item);
        return next;
      });
    },
    [],
  );

  const handleSave = async () => {
    if (submitting) return;

    if (!name.trim()) {
      toast({ variant: 'destructive', title: 'Непълни данни', description: 'Моля, въведете име на студио.' });
      return;
    }
    if (!address.trim()) {
      toast({ variant: 'destructive', title: 'Непълни данни', description: 'Моля, въведете адрес.' });
      return;
    }
    if (!coords) {
      toast({
        variant: 'destructive',
        title: 'Непълни данни',
        description: 'Моля, потвърдете адреса на картата (изберете предложение или поставете маркер).',
      });
      return;
    }
    if (addressError) {
      toast({ variant: 'destructive', title: 'Непълни данни', description: addressError });
      return;
    }
    if (!description.trim()) {
      toast({ variant: 'destructive', title: 'Непълни данни', description: 'Моля, въведете описание.' });
      return;
    }
    if (!phone.trim()) {
      toast({ variant: 'destructive', title: 'Непълни данни', description: 'Моля, въведете телефон.' });
      return;
    }
    if (!email.trim()) {
      toast({ variant: 'destructive', title: 'Непълни данни', description: 'Моля, въведете имейл.' });
      return;
    }
    if (selectedYogaTypes.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Непълни данни',
        description: 'Моля, изберете поне един тип йога.',
      });
      return;
    }

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

      const isEdit = Boolean(initialStudio?.id);
      if (isEdit) {
        formData.append('imageOrderMode', 'slots');
        for (const slot of imageSlots) {
          if (slot.kind === 'url') {
            formData.append('imageSlot', slot.url);
          } else {
            formData.append('imageSlot', NEW_IMAGE_SLOT_MARKER);
            formData.append('images', slot.file);
          }
        }
      } else {
        for (const slot of imageSlots) {
          if (slot.kind === 'file') {
            formData.append('images', slot.file);
          }
        }
      }

      const res = isEdit
        ? await fetch(`/api/studios/${initialStudio!.id}`, { method: 'PATCH', body: formData })
        : await fetch('/api/studios', { method: 'POST', body: formData });

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

  const renderYogaTypePickerButton = (t: YogaTypeCatalogEntry) => {
    const selected = selectedYogaTypes.includes(t.name);
    return (
      <Button
        key={t.name}
        type="button"
        variant="outline"
        className={cn(
          'flex h-auto w-full items-start justify-between gap-3 px-4 py-3 text-left text-base',
          selected ? 'border-accent bg-accent/10 text-accent hover:bg-accent/10' : '',
        )}
        onClick={() => {
          setSelectedYogaTypes(prev =>
            selected ? prev.filter(x => x !== t.name) : [...prev, t.name],
          );
        }}
      >
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-medium">{t.name}</div>
          <div className="line-clamp-2 text-sm text-muted-foreground">{t.description}</div>
        </div>
        {selected ? (
          <Check className="mt-1 size-5 shrink-0 text-accent" strokeWidth={2.5} aria-hidden />
        ) : null}
      </Button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent
        className={cn(
          'fixed inset-0 z-50 flex h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 shadow-lg sm:max-w-none sm:rounded-none',
          'data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100',
        )}
      >
        <DialogHeader className="shrink-0 space-y-2 px-6 pb-2 pt-5 text-left sm:text-left sm:pr-14">
          <DialogTitle className="font-display text-3xl sm:text-4xl">Студио</DialogTitle>
          <DialogDescription className="text-base sm:text-lg">
            Добавете или редактирайте информацията за вашето студио
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4 pt-2 text-base [&_label]:text-base sm:[&_label]:text-lg">
        <div className="space-y-5 pt-1">
          <div>
            <Label>Име на студио</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="напр. Лотос Йога Студио"
              className="mt-1 h-12 text-lg md:text-lg"
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
                  className="h-12 text-lg md:text-lg"
                />

                {addressDropdownOpen && addressPredictions.length ? (
                  <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-lg">
                    <ul className="max-h-64 overflow-auto py-1">
                      {addressPredictions.slice(0, 8).map((p) => (
                        <li key={p.place_id}>
                          <button
                            type="button"
                            className="w-full px-4 py-3 text-left text-base hover:bg-muted/60"
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
                            <div className="text-sm text-muted-foreground">{p.structured_formatting.secondary_text}</div>
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
                <div className="p-4 text-base text-muted-foreground">
                  За да се визуализира карта, добавете `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
                </div>
              ) : !isLoaded ? (
                <div className="p-4 text-base text-muted-foreground">Зареждане на карта…</div>
              ) : (
                <div className="h-72 w-full sm:h-80">
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

            {addressError ? <p className="text-base text-destructive">{addressError}</p> : null}
          </div>
          <div>
            <Label>Описание</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Опишете вашето студио..."
              className="mt-1 min-h-[120px] text-base md:text-lg"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Снимки</Label>
            <p className="text-sm text-muted-foreground sm:text-base">
              Първата снимка е корицата в списъците. Подредете със стрелките или плъзнете картата. Можете да премахвате снимки.
            </p>
            <Input
              type="file"
              multiple
              accept="image/*"
              className="h-auto cursor-pointer py-3 text-base file:text-base file:font-medium"
              onChange={e => {
                const files = Array.from(e.target.files ?? []);
                if (!files.length) return;
                setImageSlots(prev => [
                  ...prev,
                  ...files.map(file => ({
                    kind: 'file' as const,
                    id: crypto.randomUUID(),
                    file,
                    previewUrl: URL.createObjectURL(file),
                  })),
                ]);
                e.target.value = '';
              }}
            />
            {imageSlots.length ? (
              <div className="grid grid-cols-3 gap-2">
                {imageSlots.map((slot, idx) => {
                  const src = slot.kind === 'url' ? slot.url : slot.previewUrl;
                  const canReorder = imageSlots.length > 1;
                  return (
                    <div
                      key={slot.id}
                      draggable={canReorder}
                      onDragStart={canReorder ? onSlotDragStart(idx) : undefined}
                      onDragOver={canReorder ? onSlotDragOver : undefined}
                      onDrop={canReorder ? onSlotDrop(idx) : undefined}
                      className="group/slot relative overflow-hidden rounded-lg border border-border bg-muted/20"
                    >
                      <img
                        src={src}
                        alt=""
                        draggable={false}
                        className="pointer-events-none h-36 w-full select-none object-cover sm:h-40"
                      />
                      {idx === 0 ? (
                        <span className="absolute bottom-10 left-1 rounded bg-background/95 px-2 py-0.5 text-xs font-medium text-foreground shadow-sm">
                          Главна
                        </span>
                      ) : null}
                      {canReorder ? (
                        <div
                          className="absolute left-1 top-1 flex h-7 w-7 cursor-grab items-center justify-center rounded-md bg-background/95 text-muted-foreground shadow-sm active:cursor-grabbing"
                          title="Плъзнете за пренареждане"
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>
                      ) : null}
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="absolute right-1 top-1 h-7 w-7 opacity-90 shadow-sm group-hover/slot:opacity-100"
                        onClick={() => removeImageSlot(slot.id)}
                        aria-label="Премахни снимката"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                      {canReorder ? (
                        <div className="absolute inset-x-0 bottom-0 flex justify-center gap-0.5 bg-black/55 py-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-7 w-7"
                            disabled={idx === 0}
                            onClick={() => moveImageSlot(idx, -1)}
                            aria-label="Премести наляво"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="h-7 w-7"
                            disabled={idx === imageSlots.length - 1}
                            onClick={() => moveImageSlot(idx, 1)}
                            aria-label="Премести надясно"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-base text-muted-foreground">Можете да изберете повече от 1 снимка.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Телефон</Label>
              <Input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+359 ..."
                className="mt-1 h-12 text-lg md:text-lg"
              />
            </div>
            <div>
              <Label>Имейл</Label>
              <Input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                placeholder="info@studio.bg"
                className="mt-1 h-12 text-lg md:text-lg"
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
                <div key={a.key} className="flex items-center justify-between gap-3 rounded-lg border border-border p-4">
                  <span className="text-base sm:text-lg">{a.label}</span>
                  <Switch
                    className="scale-125"
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
            <p className="-mt-1 mb-3 text-sm text-muted-foreground sm:text-base">
              Изберете всички стилове които практикувате
            </p>
            {legacySelectedYogaTypes.length > 0 ? (
              <div className="mb-3 space-y-2">
                <p className="text-sm font-medium text-muted-foreground sm:text-base">
                  Записани стилове извън каталога (можете да ги премахнете)
                </p>
                <div className="flex flex-wrap gap-2">
                  {legacySelectedYogaTypes.map(name => (
                    <button
                      key={name}
                      type="button"
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/50 py-2 pl-3 pr-1.5 text-left text-sm font-medium transition-colors hover:bg-muted sm:text-base"
                      onClick={() => {
                        setSelectedYogaTypes(prev => prev.filter(x => x !== name));
                      }}
                    >
                      <span className="min-w-0 truncate">{name}</span>
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-background">
                        <X className="h-4 w-4" aria-hidden />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <Input
              value={yogaTypesQuery}
              onChange={e => setYogaTypesQuery(e.target.value)}
              placeholder="Търси по име, описание или категория…"
              className="mb-3 h-12 text-lg md:text-lg"
              aria-label="Филтър за типове йога"
            />
            {displayedTypesForSearch ? (
              displayedTypesForSearch.length === 0 ? (
                <p className="text-base text-muted-foreground">Няма съвпадения</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {displayedTypesForSearch.map(t => renderYogaTypePickerButton(t))}
                </div>
              )
            ) : (
              <div className="space-y-6">
                {YOGA_TYPE_CATEGORY_ORDER.map(section => {
                  const inSection = YOGA_TYPES.filter(t => t.category === section.id);
                  if (inSection.length === 0) return null;
                  return (
                    <div key={section.id}>
                      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground sm:text-base">
                        {section.label}
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {inSection.map(t => renderYogaTypePickerButton(t))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </div>
        <DialogFooter className="mt-0 shrink-0 gap-3 border-t bg-background px-6 py-5 sm:justify-end">
          <Button variant="outline" size="lg" className="text-base" onClick={onClose}>
            Отказ
          </Button>
          <Button size="lg" className="text-base" onClick={handleSave} disabled={submitting}>
            {submitting ? 'Запазване...' : 'Запази'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

