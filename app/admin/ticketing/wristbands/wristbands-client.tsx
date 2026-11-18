'use client'
import { useMemo, useState } from "react";
import useSWR from "swr";
import { useUser } from "@clerk/nextjs";
import { authUsage } from "@lib/authorise";
import { fetcher } from "@lib/fetchers";
import WristBandIcon from '@public/wristband.svg';
import { WRISTBANDS, WristBandKey, accessToWristbandKeys } from "@components/admin/scan/wristbands";

const YEAR = '2026'

type Attendee = {
  name: string,
  ticket_number: string,
  active: boolean,
  checkin_at?: number,
  passes: string[],
  access: number[],
  event_year?: string,
}

export default function WristbandsClient() {
  const { user, isLoaded } = useUser();
  const { data, error, isLoading } = useSWR("/api/admin/attendees", fetcher, { keepPreviousData: false });
  const [includeInactive, setIncludeInactive] = useState(false)
  const [expanded, setExpanded] = useState<WristBandKey | 'none' | null>(null)

  // Prefer the stored event_year; fall back to the pass names for older tickets that don't have one
  const yearOf = (attendee: Attendee) =>
    attendee.event_year ? String(attendee.event_year)
    : attendee.passes?.some((pass) => pass.includes(YEAR)) ? `${YEAR} (from pass name)`
    : 'unknown'

  const yearBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {}
    ;(data?.attendees || []).forEach((attendee: Attendee) => {
      const year = yearOf(attendee)
      breakdown[year] = (breakdown[year] || 0) + 1
    })
    return Object.entries(breakdown).sort(([a], [b]) => b.localeCompare(a))
  }, [data])

  const yearsAttendees: Attendee[] = useMemo(() => (data?.attendees || []).filter((attendee: Attendee) =>
    yearOf(attendee).startsWith(YEAR)
  ), [data])

  const attendees = useMemo(() =>
    includeInactive ? yearsAttendees : yearsAttendees.filter((attendee) => attendee.active)
  , [yearsAttendees, includeInactive])

  const { counts, byBand, noBand } = useMemo(() => {
    const counts = Object.fromEntries(WRISTBANDS.map((band) => [band.key, 0])) as Record<WristBandKey, number>
    const byBand = Object.fromEntries(WRISTBANDS.map((band) => [band.key, []])) as Record<WristBandKey, Attendee[]>
    const noBand: Attendee[] = []
    attendees.forEach((attendee) => {
      const keys = accessToWristbandKeys(attendee.access, attendee.passes.map((description) => ({ description })))
      if (keys.length === 0) noBand.push(attendee)
      keys.forEach((key) => { counts[key]++; byBand[key].push(attendee) })
    })
    return { counts, byBand, noBand }
  }, [attendees])

  if (!isLoaded) { return <div>Loading</div> }
  if (!user) { return <div>Not logged in</div> }
  if (!authUsage(user, "/admin/ticketing/wristbands")) { return <div>Not authorised</div> }
  if (error || data?.error) { return <div>Error loading attendees: {String(error || data?.error)}</div> }
  if (isLoading || !data) { return <div>Loading attendees...</div> }

  const missingAccess = attendees.filter((attendee) => !attendee.access || attendee.access.length === 0).length

  const toggle = (key: WristBandKey | 'none') => setExpanded(expanded === key ? null : key)

  const attendeeList = (list: Attendee[]) => (
    <ul className="bg-richblack-700 rounded-b px-4 py-2 mb-2 -mt-2 text-sm max-h-96 overflow-y-auto">
      {list.map((attendee) => (
        <li key={attendee.ticket_number} className="flex justify-between gap-4 py-1 border-b border-richblack-500 last:border-none">
          <span>{attendee.name}{!attendee.active ? <span className="text-chillired-300"> (inactive)</span> : null}</span>
          <span className="text-gray-400 text-right">{attendee.passes.filter((pass) => pass.includes(YEAR)).join(', ')}</span>
        </li>
      ))}
    </ul>
  )

  return (
    <div>
      <p className="text-sm text-gray-400 mb-1">
        <span className="font-bold text-white">{data.attendees?.length ?? 0}</span> attendees received from the API
        {yearBreakdown.length > 0 ? <> &mdash; {yearBreakdown.map(([year, count]) => `${year}: ${count}`).join(', ')}</> : null}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <p className="text-lg">
          <span className="font-bold">{attendees.length}</span> {YEAR} tickets
          {!includeInactive ? <span className="text-gray-400"> ({yearsAttendees.length - attendees.length} inactive excluded)</span> : null}
        </p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />
          Include inactive tickets
        </label>
      </div>

      {missingAccess > 0 ? <div className="bg-yellow-400 text-black rounded p-3 mb-4">
        {missingAccess} ticket(s) have no access code, so only their pass names were checked.
      </div> : null}

      <div className="-mx-1">
        {WRISTBANDS.map((band) => (
          <div key={band.key}>
            <button
              onClick={() => toggle(band.key)}
              className={`${band.colour} flex justify-between items-center gap-4 rounded w-full text-lg p-4 mb-2 text-left`}
            >
              <span className="flex items-center gap-4">
                {band.icon ? band.icon : <WristBandIcon className="w-8 h-8"/>}
                {band.name}
              </span>
              <span className="text-2xl font-bold">{counts[band.key]}</span>
            </button>
            {expanded === band.key && counts[band.key] > 0 ? attendeeList(byBand[band.key]) : null}
          </div>
        ))}
        <div>
          <button
            onClick={() => toggle('none')}
            className="bg-chillired-800 flex justify-between items-center gap-4 rounded w-full text-lg p-4 mb-2 text-left"
          >
            <span>No wristband matched</span>
            <span className="text-2xl font-bold">{noBand.length}</span>
          </button>
          {expanded === 'none' && noBand.length > 0 ? attendeeList(noBand) : null}
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-4">Click a row to see the attendees. A ticket can need more than one wristband, so the counts won&apos;t sum to the ticket total.</p>
    </div>
  )
}
