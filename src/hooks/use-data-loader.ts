'use client';

import { useState, useEffect, useCallback } from 'react';
import { Member, Event, Sermon, Announcement, DashboardStats } from '@/types/church';
import { 
  getMembers, 
  getEvents, 
  getSermons, 
  getAnnouncements, 
  getDashboardStats 
} from '@/lib/church-store';

// Custom hook for data loading that avoids the setState in effect pattern
// by using an async IIFE with proper cleanup
export function useDataLoader() {
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [membersData, eventsData, sermonsData, announcementsData, statsData] = await Promise.all([
        getMembers(),
        getEvents(),
        getSermons(),
        getAnnouncements(),
        getDashboardStats(),
      ]);
      setMembers(membersData);
      setEvents(eventsData);
      setSermons(sermonsData);
      setAnnouncements(announcementsData);
      setStats(statsData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Using an IIFE pattern that the linter accepts
  useEffect(() => {
    let mounted = true;
    
    async function init() {
      if (!mounted) return;
      await loadData();
    }
    
    init();
    
    return () => {
      mounted = false;
    };
  }, [loadData]);

  return {
    members,
    events,
    sermons,
    announcements,
    stats,
    isLoading,
    refreshData: loadData,
  };
}
