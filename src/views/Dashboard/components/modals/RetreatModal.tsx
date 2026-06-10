'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { GoogleMap, MarkerF } from '@react-google-maps/api';
import { useGoogleMapsLoader } from '@/hooks/useGoogleMapsLoader';
import { GripVertical, Palmtree, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { Retreat, Studio } from '@/data/mock-data';
import {
  includesOnlinePayment,
  resolvePaymentModeForPrice,
  type BookingPaymentMode,
} from '@/lib/booking-payment-mode';
import { isStripeConnectReady, type StripeConnectSummary } from '@/lib/stripe-connect';
import { isFreeClassPrice } from '@/lib/yoga-class-limits';
import { PaymentModeField } from '@/views/Dashboard/components/PaymentModeField';
import { preventDialogOutsideClose } from '@/views/Dashboard/components/preventDialogOutsideClose';
import { StripeConnectSetupModal } from '@/views/Dashboard/components/modals/StripeConnectSetupModal';

type RetreatImageUrlSlot = { kind: 'url'; id: string; url: string };
type RetreatImageFileSlot = { kind: 'file'; id: string; file: File; previewUrl: string };
type RetreatImageSlot = RetreatImageUrlSlot | RetreatImageFileSlot;

export const NEW_IMAGE_SLOT_MARKER = '__NEW__';
const DRAG_MIME = 'application/x-zenno-retreat-image-index';

export type RetreatModalPayload = {
  id?: string;
  studioId: string;
  title: string;
  description: string;
  activities: string[];
  address: string;
  lat: number;
  lng: number;
  startDate: string;
  endDate: string;
  duration: string;
  maxCapacity: number;
  price: number;
  paymentMode: BookingPaymentMode;
  isPublished: boolean;
  imageSlots: RetreatImageSlot[];
};

const DURATION_UNITS = ['часа', 'дни', 'седмици', 'месеца'] as const;
type DurationUnit = (typeof DURATION_UNITS)[number];

export function RetreatModal({
  open,
  onClose,
  onSave,
  studios,
  retreatToEdit,
  stripeConnect,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: RetreatModalPayload) => void | Promise<void>;
  studios: Studio[];
  retreatToEdit?: Retreat | null;
  stripeConnect: StripeConnectSummary | null;
}) {
  const [studioId, setStudioId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [addressPredictions, setAddressPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [durationValue, setDurationValue] = useState('');
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('дни');
  const [activitiesRaw, setActivitiesRaw] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [paymentMode, setPaymentMode] = useState<BookingPaymentMode>('onsite');
  const [stripeSetupOpen, setStripeSetupOpen] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [imageSlots, setImageSlots] = useState<RetreatImageSlot[]>([]);
  const [saving, setSaving] = useState(false);
  const suppressAutocompleteRef = useRef(false);

  const { isLoaded, apiKey } = useGoogleMapsLoader();

  const mapCenter = useMemo(() => coords ?? { lat: 42.6977, lng: 23.3219 }, [coords]);

  useEffect(() => {
    if (!open) return;
    setSaving(false);
    if (retreatToEdit) {
      setStudioId(retreatToEdit.studioId);
      setTitle(retreatToEdit.title);
      setDescription(retreatToEdit.description);
      setAddress(retreatToEdit.address);
      setAddressPredictions([]);
      setAddressDropdownOpen(false);
      setCoords({ lat: retreatToEdit.lat, lng: retreatToEdit.lng });
      setStartDate(retreatToEdit.startDate);
      setEndDate(retreatToEdit.endDate);
      const durationMatch = retreatToEdit.duration.match(/^(\d+)\s+(.+)$/);
      if (durationMatch) {
        const [, value, unit] = durationMatch;
        setDurationValue(value);
        if (DURATION_UNITS.includes(unit as DurationUnit)) {
          setDurationUnit(unit as DurationUnit);
        } else {
          setDurationUnit('дни');
        }
      } else {
        setDurationValue('');
        setDurationUnit('дни');
      }
      setActivitiesRaw(retreatToEdit.activities.join('\n'));
      setMaxCapacity(String(retreatToEdit.maxCapacity));
      setPrice(String(retreatToEdit.price));
      setPaymentMode(
        retreatToEdit.paymentMode ?? 'onsite',
      );
      setIsPublished(retreatToEdit.isPublished);
      setImageSlots(
        (retreatToEdit.images ?? []).map((url) => ({
          kind: 'url' as const,
          id: crypto.randomUUID(),
          url,
        })),
      );
      return;
    }
    setStudioId(studios[0]?.id ?? '');
    setTitle('');
    setDescription('');
    setAddress('');
    setAddressPredictions([]);
    setAddressDropdownOpen(false);
    setCoords(null);
    setStartDate('');
    setEndDate('');
    setDurationValue('');
    setDurationUnit('дни');
    setActivitiesRaw('');
    setMaxCapacity('');
    setPrice('');
    setPaymentMode('onsite');
    setStripeSetupOpen(false);
    setIsPublished(true);
    setImageSlots([]);
  }, [open, retreatToEdit, studios]);

  useEffect(() => {
    if (!open) return;
    if (!address.trim()) {
      setAddressPredictions([]);
      setAddressDropdownOpen(false);
      return;
    }
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

  const parseActivities = () =>
    Array.from(
      new Set(
        activitiesRaw
          .split('\n')
          .map((x) => x.trim())
          .filter(Boolean),
      ),
    );

  const onSlotDragStart = (index: number) => (e: React.DragEvent) => {
    e.dataTransfer.setData(DRAG_MIME, String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onSlotDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onSlotDrop = (targetIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData(DRAG_MIME);
    const from = Number(raw);
    if (Number.isNaN(from) || from === targetIndex) return;
    setImageSlots((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  };

  const handleSave = async () => {
    const activities = parseActivities();
    const durationNum = Number(durationValue);
    const duration = Number.isFinite(durationNum) && durationNum > 0 ? `${durationNum} ${durationUnit}` : '';
    const capacity = Number(maxCapacity);
    const parsedPrice = Number(price);
    if (!studioId || !title.trim() || !description.trim() || !address.trim() || !startDate || !endDate || !duration) {
      toast.error('Попълнете всички задължителни полета.');
      return;
    }
    if (!Number.isFinite(capacity) || capacity <= 0) {
      toast.error('Въведете валиден максимален капацитет.');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      toast.error('Цената трябва да е 0 или положително число.');
      return;
    }
    if (!coords) {
      toast.error('Изберете локация на картата.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error('Крайната дата трябва да е след началната.');
      return;
    }
    if (activities.length === 0) {
      toast.error('Добавете поне една активност.');
      return;
    }

    const resolvedPaymentMode = resolvePaymentModeForPrice(parsedPrice, paymentMode);
    if (includesOnlinePayment(resolvedPaymentMode) && !isStripeConnectReady(stripeConnect)) {
      toast.error('Свържете Stripe акаунта си, за да приемате онлайн плащания.');
      setStripeSetupOpen(true);
      return;
    }

    setSaving(true);
    try {
      await Promise.resolve(
        onSave({
          id: retreatToEdit?.id,
          studioId,
          title: title.trim(),
          description: description.trim(),
          activities,
          address: address.trim(),
          lat: coords.lat,
          lng: coords.lng,
          startDate,
          endDate,
          duration: duration.trim(),
          maxCapacity: capacity,
          price: parsedPrice,
          paymentMode: resolvedPaymentMode,
          isPublished,
          imageSlots,
        }),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        {...preventDialogOutsideClose}
        className="flex max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-h-[90vh] sm:gap-4 sm:overflow-y-auto sm:p-6"
      >
        <DialogHeader className="shrink-0 space-y-1.5 px-4 pb-2 pt-5 text-left sm:px-0 sm:pt-0 sm:pr-14">
          <DialogTitle className="font-display flex items-center gap-2 text-xl sm:text-2xl">
            <Palmtree className="h-5 w-5 shrink-0 text-primary" /> {retreatToEdit ? 'Редактирай рийтрийт' : 'Нов рийтрийт'}
          </DialogTitle>
          <DialogDescription>Добавете събитие с дата, активности, локация и снимки.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-2 sm:px-0 sm:pb-0">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Студио</Label>
              <select
                value={studioId}
                onChange={(e) => setStudioId(e.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {studios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Продължителност</Label>
              <div className="mt-1 grid grid-cols-[1fr_auto] gap-2">
                <Input
                  type="number"
                  min={1}
                  value={durationValue}
                  onChange={(e) => setDurationValue(e.target.value)}
                  placeholder="напр. 3"
                />
                <select
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value as DurationUnit)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {DURATION_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Максимален капацитет</Label>
              <Input
                type="number"
                min={1}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                placeholder="напр. 20"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Цена (лв.)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0 за безплатно"
                className="mt-1"
              />
            </div>
          </div>

          {Number.isFinite(Number(price)) && !isFreeClassPrice(Number(price)) ? (
            <PaymentModeField
              value={paymentMode}
              onChange={setPaymentMode}
              stripeConnect={stripeConnect}
              onRequireStripeSetup={() => setStripeSetupOpen(true)}
            />
          ) : null}

          <div>
            <Label>Име на рийтрийт</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="напр. Планински уикенд рийтрийт" className="mt-1" />
          </div>

          <div>
            <Label>Описание</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Какво включва рийтрийтът?"
              className="mt-1 min-h-[110px]"
            />
          </div>

          <div>
            <Label>Какво ще правим (по едно на ред)</Label>
            <Textarea
              value={activitiesRaw}
              onChange={(e) => setActivitiesRaw(e.target.value)}
              placeholder={'Сутрешна практика\nМедитация\nПреход в планината'}
              className="mt-1 min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Начална дата</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Крайна дата</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Локация</Label>
            <div className="relative">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onFocus={() => {
                  if (addressPredictions.length) setAddressDropdownOpen(true);
                }}
                onBlur={() => {
                  window.setTimeout(() => setAddressDropdownOpen(false), 150);
                }}
                placeholder="Адрес на рийтрийта"
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
                            setAddress(p.description);
                            setAddressDropdownOpen(false);
                            setAddressPredictions([]);

                            if (!window.google?.maps?.Geocoder) return;
                            const geocoder = new window.google.maps.Geocoder();
                            geocoder.geocode({ placeId: p.place_id }, (results, status) => {
                              if (status !== 'OK' || !results?.[0]?.geometry?.location) return;
                              const location = results[0].geometry.location;
                              setCoords({ lat: location.lat(), lng: location.lng() });
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
            <div className="rounded-xl border border-border overflow-hidden bg-muted/20">
              {!apiKey ? (
                <div className="p-4 text-sm text-muted-foreground">Добавете `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, за да се визуализира карта.</div>
              ) : !isLoaded ? (
                <div className="p-4 text-sm text-muted-foreground">Зареждане на карта…</div>
              ) : (
                <div className="h-56 w-full sm:h-72">
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={mapCenter}
                    zoom={coords ? 13 : 11}
                    onClick={(e) => {
                      const lat = e.latLng?.lat();
                      const lng = e.latLng?.lng();
                      if (lat == null || lng == null) return;
                      setCoords({ lat, lng });
                    }}
                    options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: false }}
                  >
                    {coords ? <MarkerF position={coords} draggable onDragEnd={(e) => {
                      const lat = e.latLng?.lat();
                      const lng = e.latLng?.lng();
                      if (lat == null || lng == null) return;
                      setCoords({ lat, lng });
                    }} /> : null}
                  </GoogleMap>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Снимки</Label>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (!files.length) return;
                setImageSlots((prev) => [
                  ...prev,
                  ...files.map((file) => ({
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
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {imageSlots.map((slot, idx) => {
                  const src = slot.kind === 'url' ? slot.url : slot.previewUrl;
                  return (
                    <div
                      key={slot.id}
                      draggable={imageSlots.length > 1}
                      onDragStart={onSlotDragStart(idx)}
                      onDragOver={onSlotDragOver}
                      onDrop={onSlotDrop(idx)}
                      className="group/slot relative overflow-hidden rounded-lg border"
                    >
                      <img src={src} alt="" className="h-32 w-full object-cover" />
                      <div className="absolute left-1 top-1 rounded bg-background/90 p-1">
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="absolute right-1 top-1 h-7 w-7"
                        onClick={() => {
                          setImageSlots((prev) => {
                            const current = prev.find((s) => s.id === slot.id);
                            if (current?.kind === 'file') URL.revokeObjectURL(current.previewUrl);
                            return prev.filter((s) => s.id !== slot.id);
                          });
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Публикуван</p>
              <p className="text-xs text-muted-foreground">Непубликуваните рийтрийти не се показват на началната страница.</p>
            </div>
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
        </div>
        </div>

        <DialogFooter className="mt-0 shrink-0 gap-3 border-t bg-background px-4 py-4 sm:mt-4 sm:border-t-0 sm:px-0 sm:py-0 [&_button]:w-full sm:[&_button]:w-auto">
          <Button variant="outline" onClick={onClose}>
            Отказ
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Запазване…' : 'Запази'}
          </Button>
        </DialogFooter>
      </DialogContent>
      <StripeConnectSetupModal
        open={stripeSetupOpen}
        onClose={() => setStripeSetupOpen(false)}
        stripeConnect={stripeConnect}
      />
    </Dialog>
  );
}
