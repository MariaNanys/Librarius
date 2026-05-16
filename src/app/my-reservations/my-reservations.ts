import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Reservation, ReservationService } from '../services/reservation.service';

type Filter = 'all' | 'pending' | 'accepted' | 'ended';
type ReservationGroup = { date: string; items: Reservation[] };

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './my-reservations.html',
  styleUrl: './my-reservations.scss',
})
export class MyReservationsComponent implements OnInit, OnDestroy {
  private reservationService = inject(ReservationService);

  reservations = signal<Reservation[]>([]);
  isLoading = signal<boolean>(true);
  loadError = signal<string>('');
  searchTerm = signal<string>('');
  activeFilter = signal<Filter>('all');
  currentPage = signal<number>(1);
  isEditingPage = signal<boolean>(false);

  cancelPopupOpen = signal<boolean>(false);
  reservationToCancel = signal<Reservation | null>(null);
  isCancelling = signal<boolean>(false);
  cancelError = signal<string>('');
  successPopupOpen = signal<boolean>(false);

  readonly pageSize = 5;
  private readonly endedStatuses = ['closed', 'rejected', 'cancelled', 'expired'];

  private successTimeoutHandle: number | null = null;

  filteredReservations = computed<Reservation[]>(() => {
    const filter = this.activeFilter();
    const term = this.searchTerm().trim().toLowerCase();

    return this.reservations()
      .filter((r) => {
        if (filter === 'pending') return r.status.name === 'pending';
        if (filter === 'accepted') return r.status.name === 'accepted';
        if (filter === 'ended') return this.endedStatuses.includes(r.status.name);
        return true;
      })
      .filter((r) => {
        if (!term) return true;
        return (
          String(r.id).includes(term) ||
          r.book.title.toLowerCase().includes(term) ||
          r.book.authors[0]?.name.toLowerCase().includes(term) ||
          r.library.name.toLowerCase().includes(term) ||
          r.library.city.toLowerCase().includes(term) ||
          r.library.address.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  });

  totalPages = computed<number>(() => {
    return Math.max(1, Math.ceil(this.filteredReservations().length / this.pageSize));
  });

  paginatedGroups = computed<ReservationGroup[]>(() => {
    const all = this.filteredReservations();
    const start = (this.currentPage() - 1) * this.pageSize;
    const slice = all.slice(start, start + this.pageSize);

    const groups = new Map<string, Reservation[]>();
    for (const r of slice) {
      const date = this.formatDate(r.start_time);
      if (!groups.has(date)) groups.set(date, []);
      groups.get(date)!.push(r);
    }
    return Array.from(groups, ([date, items]) => ({ date, items }));
  });

  ngOnInit(): void {
    this.loadReservations();
  }

  ngOnDestroy(): void {
    if (this.successTimeoutHandle !== null) {
      clearTimeout(this.successTimeoutHandle);
    }
  }

  loadReservations(): void {
    this.isLoading.set(true);
    this.loadError.set('');
    this.reservationService.list().subscribe({
      next: (data) => {
        this.reservations.set(data ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Błąd pobierania rezerwacji:', err);
        this.loadError.set('Nie udało się pobrać listy rezerwacji. Spróbuj ponownie.');
        this.isLoading.set(false);
      },
    });
  }

  setFilter(filter: Filter): void {
    this.activeFilter.set(filter);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  changePage(newPage: number): void {
    const total = this.totalPages();
    if (newPage < 1 || newPage > total) return;
    this.currentPage.set(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleEditPage(): void {
    this.isEditingPage.set(true);
  }

  handlePageInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newPage = Number(input.value);
    if (newPage > 0 && newPage <= this.totalPages()) {
      this.changePage(newPage);
    }
    this.isEditingPage.set(false);
  }

  formatDate(dt: string): string {
    const d = new Date(dt);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
  }

  formatDateTime(dt: string): string {
    const d = new Date(dt);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}.${mm}.${d.getFullYear()}, ${hh}:${min}`;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Oczekująca',
      accepted: 'Potwierdzona',
      rejected: 'Odrzucona',
      cancelled: 'Anulowana',
      expired: 'Wygasła',
      closed: 'Zakończona',
    };
    return map[status] ?? status;
  }

  isPending(status: string): boolean {
    return status === 'pending';
  }

  isAccepted(status: string): boolean {
    return status === 'accepted';
  }

  isEnded(status: string): boolean {
    return this.endedStatuses.includes(status);
  }

  canCancel(status: string): boolean {
    return status === 'pending' || status === 'accepted';
  }

  openCancelPopup(reservation: Reservation): void {
    this.reservationToCancel.set(reservation);
    this.cancelError.set('');
    this.cancelPopupOpen.set(true);
  }

  closeCancelPopup(): void {
    this.cancelPopupOpen.set(false);
    this.reservationToCancel.set(null);
    this.isCancelling.set(false);
    this.cancelError.set('');
  }

  confirmCancel(): void {
    const reservation = this.reservationToCancel();
    if (!reservation) return;

    this.isCancelling.set(true);
    this.cancelError.set('');
    this.reservationService.cancel(reservation.id).subscribe({
      next: () => {
        this.closeCancelPopup();
        this.successPopupOpen.set(true);
        this.loadReservations();
        this.scheduleSuccessClose();
      },
      error: (err) => {
        console.error('Błąd anulowania:', err);
        this.cancelError.set('Nie udało się anulować rezerwacji.');
        this.isCancelling.set(false);
      },
    });
  }

  private scheduleSuccessClose(): void {
    if (this.successTimeoutHandle !== null) {
      clearTimeout(this.successTimeoutHandle);
    }
    this.successTimeoutHandle = window.setTimeout(() => {
      this.successPopupOpen.set(false);
      this.successTimeoutHandle = null;
    }, 2000);
  }

  getCover(url: string | null | undefined): string {
    return url ? url : '/assets/book_1.webp';
  }
}
