import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useInventoryAuditLog } from '../../hooks/useInventory';
import { formatDate } from '../../utils/formatters';
import clsx from 'clsx';

export default function AuditLogDrawer({ variationId, onClose }) {
  const { data, isLoading } = useInventoryAuditLog({ variationId });

  return (
    <Transition.Root show={!!variationId} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                      <Dialog.Title className="text-lg font-semibold">
                        Stock History
                      </Dialog.Title>
                      <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Log entries */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                      {isLoading ? (
                        <div className="space-y-4">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                          ))}
                        </div>
                      ) : !data?.entries?.length ? (
                        <p className="text-sm text-gray-400 py-8 text-center">No history yet</p>
                      ) : (
                        <div className="space-y-3">
                          {data.entries.map((entry) => (
                            <div
                              key={entry.id}
                              className="border rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className={clsx(
                                  'text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded',
                                  entry.adjustment_type === 'received' && 'bg-green-100 text-green-700',
                                  entry.adjustment_type === 'sold' && 'bg-blue-100 text-blue-700',
                                  entry.adjustment_type === 'damaged' && 'bg-red-100 text-red-700',
                                  entry.adjustment_type === 'correction' && 'bg-yellow-100 text-yellow-700',
                                  entry.adjustment_type === 'returned' && 'bg-purple-100 text-purple-700',
                                )}>
                                  {entry.adjustment_type}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDate(entry.created)}
                                </span>
                              </div>
                              <p className="text-sm">
                                <span className="text-gray-500">
                                  {entry.quantity_before} →{' '}
                                </span>
                                <span className="font-semibold">{entry.quantity_after}</span>
                                <span className={clsx(
                                  'ml-2 text-xs font-medium',
                                  entry.quantity_change > 0 ? 'text-green-600' : 'text-red-600'
                                )}>
                                  ({entry.quantity_change > 0 ? '+' : ''}{entry.quantity_change})
                                </span>
                              </p>
                              {entry.reason && (
                                <p className="text-xs text-gray-500 mt-1">{entry.reason}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                by {entry.performed_by_name}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
