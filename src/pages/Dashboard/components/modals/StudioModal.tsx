import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useMemo, useState } from 'react';
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

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
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
  }, [open]);

  useEffect(() => {
    if (!address.trim()) {
      setCoords(null);
      setAddressError(null);
      return;
    }

    if (!apiKey) {
      setCoords(null);
      setAddressError('Липсва Google Maps API ключ (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).');
      return;
    }

    const handle = window.setTimeout(() => {
      if (!window.google?.maps?.Geocoder) return;

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: address.trim() }, (results, status) => {
        if (status !== 'OK' || !results?.[0]?.geometry?.location) {
          setCoords(null);
          setAddressError('Адресът не е намерен. Опитайте по-точен адрес.');
          return;
        }

        const location = results[0].geometry.location;
        setCoords({ lat: location.lat(), lng: location.lng() });
        setAddressError(null);
      });
    }, 500);

    return () => window.clearTimeout(handle);
  }, [address, apiKey]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [imagePreviews]);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Студио</DialogTitle>
          <DialogDescription>Добавете или редактирайте информацията за вашето студио</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div><Label>Име на студио</Label><Input placeholder="напр. Лотос Йога Студио" className="mt-1" /></div>
          <div className="space-y-2">
            <div>
              <Label>Адрес</Label>
              <Input
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="ул. Витоша 45, София"
                className="mt-1"
              />
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
                    options={{
                      mapTypeControl: false,
                      streetViewControl: false,
                      fullscreenControl: false,
                    }}
                  >
                    {coords ? <MarkerF position={coords} /> : null}
                  </GoogleMap>
                </div>
              )}
            </div>

            {addressError ? <p className="text-sm text-destructive">{addressError}</p> : null}
          </div>
          <div><Label>Описание</Label><Textarea placeholder="Опишете вашето студио..." className="mt-1" rows={3} /></div>
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.name} className="h-24 w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Можете да изберете повече от 1 снимка.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Телефон</Label><Input placeholder="+359 ..." className="mt-1" /></div>
            <div><Label>Имейл</Label><Input type="email" placeholder="info@studio.bg" className="mt-1" /></div>
          </div>
          <div><Label>Уебсайт</Label><Input placeholder="https://..." className="mt-1" /></div>
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
                  <Switch />
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Отказ</Button>
          <Button onClick={onSave}>Запази</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

