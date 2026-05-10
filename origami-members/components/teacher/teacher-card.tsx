import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export type TeacherCardProps = {
  id: string;
  displayName: string;
  bio: string | null;
  photoUrl: string | null;
  specialties: string[];
  pricePerSession: number;
  stripeReady: boolean;
};

export function TeacherCard({
  id,
  displayName,
  bio,
  photoUrl,
  specialties,
  pricePerSession,
  stripeReady,
}: TeacherCardProps) {
  return (
    <Link href={`/teachers/${id}`} className="group">
      <Card className="h-full transition group-hover:border-primary/40 group-hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <div className="flex items-start gap-4">
            <div className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-full bg-muted">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl text-muted-foreground">
                  🎓
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-extrabold">
                {displayName}
              </h3>
              <p className="mt-1 text-sm font-bold text-primary">
                ¥{pricePerSession.toLocaleString()}
                <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                  /60分
                </span>
              </p>
            </div>
          </div>

          {bio && (
            <p className="line-clamp-3 text-xs leading-6 text-muted-foreground">
              {bio}
            </p>
          )}

          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {specialties.slice(0, 3).map((s) => (
                <Badge key={s} variant="outline" className="text-[10px]">
                  {s}
                </Badge>
              ))}
              {specialties.length > 3 && (
                <Badge variant="outline" className="text-[10px]">
                  +{specialties.length - 3}
                </Badge>
              )}
            </div>
          )}

          {!stripeReady && (
            <p className="mt-auto text-[10px] text-muted-foreground">
              ※ 予約機能は準備中
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
