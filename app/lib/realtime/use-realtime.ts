'use client';

import { useEffect, useState, useCallback } from 'react';
import { RealtimeClient, type RealtimePayload } from './client';
import type { Task, Customer, Project } from '@prisma/client';

/**
 * Hook for real-time task updates
 */
export function useRealtimeTaskUpdates(projectId: string, initialTasks: Task[] = []) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isConnected, setIsConnected] = useState(false);

  const handleUpdate = useCallback((payload: RealtimePayload<Task>) => {
    if (payload.eventType === 'INSERT') {
      setTasks((prev) => [...prev, payload.new]);
    } else if (payload.eventType === 'UPDATE') {
      setTasks((prev) =>
        prev.map((task) => (task.id === payload.new.id ? payload.new : task))
      );
    } else if (payload.eventType === 'DELETE') {
      setTasks((prev) => prev.filter((task) => task.id !== payload.old.id));
    }
  }, []);

  useEffect(() => {
    const client = new RealtimeClient();
    setIsConnected(true);

    const unsubscribe = client.subscribeToTaskUpdates(projectId, handleUpdate);

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [projectId, handleUpdate]);

  return { tasks, isConnected, setTasks };
}

/**
 * Hook for real-time customer updates
 */
export function useRealtimeCustomerUpdates(
  organizationId: string,
  initialCustomers: Customer[] = []
) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isConnected, setIsConnected] = useState(false);

  const handleUpdate = useCallback((payload: RealtimePayload<Customer>) => {
    if (payload.eventType === 'INSERT') {
      setCustomers((prev) => [payload.new, ...prev]);
    } else if (payload.eventType === 'UPDATE') {
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === payload.new.id ? payload.new : customer
        )
      );
    } else if (payload.eventType === 'DELETE') {
      setCustomers((prev) => prev.filter((customer) => customer.id !== payload.old.id));
    }
  }, []);

  useEffect(() => {
    const client = new RealtimeClient();
    setIsConnected(true);

    const unsubscribe = client.subscribeToCustomerUpdates(organizationId, handleUpdate);

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [organizationId, handleUpdate]);

  return { customers, isConnected, setCustomers };
}

/**
 * Hook for real-time project updates
 */
export function useRealtimeProjectUpdates(
  organizationId: string,
  initialProjects: Project[] = []
) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isConnected, setIsConnected] = useState(false);

  const handleUpdate = useCallback((payload: RealtimePayload<Project>) => {
    if (payload.eventType === 'INSERT') {
      setProjects((prev) => [payload.new, ...prev]);
    } else if (payload.eventType === 'UPDATE') {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === payload.new.id ? payload.new : project
        )
      );
    } else if (payload.eventType === 'DELETE') {
      setProjects((prev) => prev.filter((project) => project.id !== payload.old.id));
    }
  }, []);

  useEffect(() => {
    const client = new RealtimeClient();
    setIsConnected(true);

    const unsubscribe = client.subscribeToProjectUpdates(organizationId, handleUpdate);

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [organizationId, handleUpdate]);

  return { projects, isConnected, setProjects };
}