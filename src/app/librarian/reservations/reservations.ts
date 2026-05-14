import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Reservation, ReservationService } from '../../services/reservation.service';

type Filter = 'all' | 'pending' | 'accepted' | 'ended';

@Component({
  selector: 'app-librarian-reservations',
  templateUrl: './reservations.html',
  styleUrl: './reservations.scss',
})
export class LibrarianReservationsComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  reservations = signal<Reservation[]>([]);
  isLoading = signal<boolean>(true);
  loadError = signal<string>('');
  searchTerm = signal<string>('');
  activeFilter = signal<Filter>('all');
  currentPage = signal<number>(1);
  isEditingPage = signal<boolean>(false);
  expandedId = signal<number | null>(null);

  acceptPopupOpen = signal<boolean>(false);
  reservationToAccept = signal<Reservation | null>(null);
  isAccepting = signal<boolean>(false);
  acceptError = signal<string>('');

  rejectPopupOpen = signal<boolean>(false);
  reservationToReject = signal<Reservation | null>(null);
  isRejecting = signal<boolean>(false);
  rejectError = signal<string>('');

  readonly pageSize = 7;
  private readonly endedStatuses = ['closed', 'rejected', 'cancelled', 'expired'];

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
        const reader = r.reader;
        return (
          String(r.id).includes(term) ||
          (r.book.isbn ?? '').toLowerCase().includes(term) ||
          r.book.title.toLowerCase().includes(term) ||
          (reader?.first_name ?? '').toLowerCase().includes(term) ||
          (reader?.last_name ?? '').toLowerCase().includes(term) ||
          (reader?.email ?? '').toLowerCase().includes(term)
        );
      })
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  });

  totalPages = computed<number>(() => {
    return Math.max(1, Math.ceil(this.filteredReservations().length / this.pageSize));
  });

  paginatedReservations = computed<Reservation[]>(() => {
    const all = this.filteredReservations();
    const start = (this.currentPage() - 1) * this.pageSize;
    return all.slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const f = params.get('filter');
      if (f === 'pending' || f === 'accepted' || f === 'ended') {
        this.activeFilter.set(f);
      } else {
        this.activeFilter.set('all');
      }
      this.currentPage.set(1);
      this.expandedId.set(null);
    });
    this.loadReservations();
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
        this.loadError.set('Nie udało się pobrać listy rezerwacji.');
        this.isLoading.set(false);
      },
    });
  }

  setFilter(filter: Filter): void {
    const queryParams = filter === 'all' ? {} : { filter };
    this.router.navigate([], { relativeTo: this.route, queryParams });
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

  toggleExpand(id: number): void {
    this.expandedId.update((current) => (current === id ? null : id));
  }

  isPending(status: string): boolean {
    return status === 'pending';
  }

  formatDate(dt: string | null): string {
    if (!dt) return '-';
    const d = new Date(dt);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}.${mm}.${d.getFullYear()}`;
  }

  endTimeDisplay(r: Reservation): string {
    if (r.status.name === 'pending') return '-';
    return this.formatDate(r.planned_end_time ?? r.end_time ?? r.updated_at);
  }

  pickupDeadline(): string {
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 72);
    return this.formatDate(deadline.toISOString());
  }

  authorsLabel(r: Reservation): string {
    return r.book.authors?.map((a) => a.name).join(', ') || '-';
  }

  readerName(r: Reservation): string {
    if (!r.reader) return '-';
    return `${r.reader.first_name} ${r.reader.last_name}`.trim() || '-';
  }

  statusGroup(status: string): 'pending' | 'accepted' | 'ended' {
    if (status === 'pending') return 'pending';
    if (status === 'accepted') return 'accepted';
    return 'ended';
  }

  statusLabel(status: string): string {
    const group = this.statusGroup(status);
    if (group === 'pending') return 'Oczekująca';
    if (group === 'accepted') return 'Potwierdzona';
    return 'Zakończona';
  }

  openAcceptPopup(reservation: Reservation, event: Event): void {
    event.stopPropagation();
    if (!this.isPending(reservation.status.name)) return;
    this.reservationToAccept.set(reservation);
    this.acceptError.set('');
    this.acceptPopupOpen.set(true);
  }

  closeAcceptPopup(): void {
    this.acceptPopupOpen.set(false);
    this.reservationToAccept.set(null);
    this.isAccepting.set(false);
    this.acceptError.set('');
  }

  confirmAccept(): void {
    const reservation = this.reservationToAccept();
    if (!reservation) return;

    this.isAccepting.set(true);
    this.acceptError.set('');
    this.reservationService.accept(reservation.id).subscribe({
      next: () => {
        this.closeAcceptPopup();
        this.loadReservations();
      },
      error: (err) => {
        console.error('Błąd potwierdzania:', err);
        this.acceptError.set(err?.error?.detail || 'Nie udało się potwierdzić rezerwacji.');
        this.isAccepting.set(false);
      },
    });
  }

  openRejectPopup(reservation: Reservation, event: Event): void {
    event.stopPropagation();
    if (!this.isPending(reservation.status.name)) return;
    this.reservationToReject.set(reservation);
    this.rejectError.set('');
    this.rejectPopupOpen.set(true);
  }

  closeRejectPopup(): void {
    this.rejectPopupOpen.set(false);
    this.reservationToReject.set(null);
    this.isRejecting.set(false);
    this.rejectError.set('');
  }

  confirmReject(): void {
    const reservation = this.reservationToReject();
    if (!reservation) return;

    this.isRejecting.set(true);
    this.rejectError.set('');
    this.reservationService.reject(reservation.id).subscribe({
      next: () => {
        this.closeRejectPopup();
        this.loadReservations();
      },
      error: (err) => {
        console.error('Błąd anulowania:', err);
        this.rejectError.set(err?.error?.detail || 'Nie udało się anulować rezerwacji.');
        this.isRejecting.set(false);
      },
    });
  }
}
