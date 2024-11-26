import { Loading01 } from "@untitled-ui/icons-react";
import React from "react";
import { Accordion } from ".//ui";
import { useSchedule } from "../hooks/use-schedule";
import { useStation } from "../hooks/use-station";
import { components } from "../schema";
import { cn, formatDateToTime, formatRelativeToNow } from "../utils";

export type GroupedSchedule = Record<
  string,
  Record<string, Array<components["schemas"]["Schedule"]>>
>;

const ScheduleLine = ({
  lineKey,
  destKey,
  groupedSchedule,
}: {
  lineKey: string;
  destKey: string;
  groupedSchedule: GroupedSchedule;
}) => {
  const hook = useStation(destKey);

  const station = hook.data?.data;

  return (
    <div key={destKey} className="flex flex-col gap-1 pb-1 pt-0.5">
      <div className="flex items-center justify-between gap-2 text-xs opacity-50">
        <p>Arah menuju</p>
        <p>Berangkat pukul</p>
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center">
          <h3 className="font text-xl font-medium capitalize">
            {station?.name.toLocaleLowerCase()}{" "}
          </h3>
        </div>
        {groupedSchedule[lineKey]?.[destKey]?.[0]?.departs_at ? (
          <div className="flex flex-col gap-1 text-right">
            <p className="font-mono text-lg font-medium tracking-tight">
              {formatDateToTime(
                groupedSchedule[lineKey]?.[destKey]?.[0]?.departs_at,
              )}
            </p>

            <p className="text-xs opacity-30">
              {formatRelativeToNow(
                groupedSchedule[lineKey]?.[destKey]?.[0]?.departs_at,
              )}
            </p>
          </div>
        ) : null}
      </div>
      {(groupedSchedule[lineKey]?.[destKey] ?? []).slice(1, 5).length > 0 ? (
        <div className="flex flex-col gap-2.5">
          <p className="text-xs opacity-50">Jam berikutnya</p>
          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4 md:gap-1">
            {(groupedSchedule[lineKey]?.[destKey] ?? [])
              .slice(1, 5)
              .map((train) => (
                <div key={train.id} className="flex flex-col gap-0.5">
                  <p className="font-mono text-sm font-semibold">
                    {formatDateToTime(train.departs_at)}
                  </p>
                  <p className="text-xs opacity-30">
                    {formatRelativeToNow(train.departs_at)}
                  </p>
                </div>
              ))}
          </div>
        </div>
      ) : null}
      {/*       {(groupedSchedule[lineKey]?.[destKey] ?? []).slice(
        5,
        (groupedSchedule[lineKey]?.[destKey] ?? []).length - 5,
      ).length > 0 ? (
        <Accordion.Root type="multiple" className="mt-0 w-full">
          <Accordion.Item
            value="jam-keberangkatan"
            className={cn("pb-2", {
              "border-b-none": id === arr.length - 1 && arr.length > 1,
            })}
          >
            <Accordion.Trigger className="my-0 h-[10px] text-xs font-normal opacity-30">
              Lihat semua
            </Accordion.Trigger>
            <Accordion.Content className="grid grid-cols-4 gap-2 pt-1 md:grid-cols-5">
              {(groupedSchedule[lineKey]?.[destKey] ?? [])
                .slice(
                  5,
                  (groupedSchedule[lineKey]?.[destKey] ?? []).length - 5,
                )
                .map((train) => (
                  <div
                    key={train.id}
                    className="flex rounded-md bg-zinc-500/10 px-2 py-1.5 text-sm"
                  >
                    <span className="mx-auto text-center font-mono font-semibold text-foreground/80">
                      {formatTime(train.departs_at)}
                    </span>
                  </div>
                ))}
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      ) : null} */}

      {/*     : id === arr.length - 1 && arr.length > 0 ? null : (
        <span className="h-[1px] w-full border-b pb-2 pt-1" />
      )} */}
    </div>
  );
};

export const StationItem = ({ stationId }: { stationId: string }) => {
  const { data: schedules, isLoading, isValidating } = useSchedule(stationId);

  const groupedSchedule = React.useMemo(
    () =>
      schedules?.data
        .filter((x) => {
          // filter clock from now on
          const date = new Date(x.departs_at);
          const now = new Date();
          return (
            date.getHours() + date.getMinutes() / 60 >=
            now.getHours() + now.getMinutes() / 60
          );
        })
        .reduce((acc: GroupedSchedule, obj) => {
          const lineKey = `${obj.line}-${obj.metadata.origin?.color}`;
          const destKey = obj.station_destination_id;

          const lineKeyRecord = acc[lineKey] ?? {};
          const destKeyArray = lineKeyRecord[destKey] ?? [];

          destKeyArray.push({ ...obj });

          lineKeyRecord[destKey] = destKeyArray;
          acc[lineKey] = lineKeyRecord;
          return acc;
        }, {}),
    [schedules, isValidating],
  );

  const { data: station } = useStation(stationId);

  const isEmpty = Object.keys(groupedSchedule ?? {}).length === 0;

  return (
    <Accordion.Root
      type="multiple"
      className="w-full pr-1 pt-2"
      defaultValue={[stationId]}
    >
      <Accordion.Item value={stationId}>
        <Accordion.Trigger className="items-center hover:no-underline">
          <div className="flex w-full flex-col gap-1 text-left">
            <p className="text-xs opacity-50">Stasiun</p>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold capitalize">
                {station?.data.name.toLocaleLowerCase()}
              </h1>
              {isLoading || isValidating ? (
                <Loading01 className="size-4 animate-spin opacity-50" />
              ) : null}
            </div>
          </div>
        </Accordion.Trigger>

        <Accordion.Content>
          {isLoading ? (
            <div className="flex animate-pulse flex-col gap-2">
              <div className="flex h-full w-full gap-3">
                <div
                  className={cn("h-[50px] w-[5px] rounded-full bg-zinc-500/10")}
                />
                <div className={cn("flex w-full flex-col gap-2")}>
                  <div className="flex flex-col gap-1 pb-1 pt-0.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="h-[13px] w-[80px] rounded-md bg-zinc-500/10" />
                      <div className="h-[13px] w-[50px] rounded-md bg-zinc-500/10" />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="mt-1 h-[25px] w-[80px] rounded-md bg-zinc-500/10" />

                      <div className="mt-1 h-[25px] w-[70px] rounded-md bg-zinc-500/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : isEmpty ? (
            <p className="text-sm opacity-50">
              Jadwal kereta api tidak tersedia. Cek lagi pada esok hari.
            </p>
          ) : groupedSchedule ? (
            Object.keys(groupedSchedule).map((lineKey, id, arr) => (
              <div key={lineKey} className="flex flex-col gap-2">
                <div className="flex h-full w-full gap-3">
                  <div
                    className={cn("h-100% w-[5px]", {
                      "rounded-full": arr.length === 1,
                      "rounded-b-none rounded-t-full":
                        id === 0 && arr.length > 1,

                      "rounded-b-full rounded-t-none":
                        id === arr.length - 1 && arr.length > 1,
                    })}
                    style={{ backgroundColor: lineKey.split("-")[1] }}
                  />
                  <div
                    className={cn("flex w-full flex-col gap-2", {
                      "py-0": arr.length === 1,
                      "pb-2 pt-0": id === 0 && arr.length > 1,

                      "pb-0 pt-2": id === arr.length - 1 && arr.length > 1,
                    })}
                  >
                    {Object.keys(groupedSchedule[lineKey] ?? {}).map(
                      (destKey) => (
                        <ScheduleLine
                          key={destKey}
                          lineKey={lineKey}
                          destKey={destKey}
                          groupedSchedule={groupedSchedule}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : null}
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
};