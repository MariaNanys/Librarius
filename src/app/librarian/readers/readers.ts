import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Reservation, ReservationService } from '../../services/reservation.service';

interface Reader {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  region: number | null;
  date_joined: string;
  activeCount: number;
  completedCount: number;
  failedCount: number;
}

@Component({
  selector: 'app-librarian-readers',
  templateUrl: './readers.html',
  styleUrl: './readers.scss',
})
export class LibrarianReadersComponent implements OnInit {
  private reservationService = inject(ReservationService);

  reservations = signal<Reservation[]>([]);
  isLoading = signal<boolean>(true);
  loadError = signal<string>('');
  searchTerm = signal<string>('');
  currentPage = signal<number>(1);
  isEditingPage = signal<boolean>(false);
  expandedId = signal<number | null>(null);

  readonly pageSize = 7;
  private readonly activeStatuses = ['pending', 'accepted'];
  private readonly failedStatuses = ['rejected', 'cancelled', 'expired'];

  regions = [
    { id: 1, name: 'Dolnośląskie' },
    { id: 2, name: 'Kujawsko-Pomorskie' },
    { id: 3, name: 'Lubelskie' },
    { id: 4, name: 'Lubuskie' },
    { id: 5, name: 'Łódzkie' },
    { id: 6, name: 'Małopolskie' },
    { id: 7, name: 'Mazowieckie' },
    { id: 8, name: 'Opolskie' },
    { id: 9, name: 'Podkarpackie' },
    { id: 10, name: 'Podlaskie' },
    { id: 11, name: 'Pomorskie' },
    { id: 12, name: 'Śląskie' },
    { id: 13, name: 'Świętokrzyskie' },
    { id: 14, name: 'Warmińsko-Mazurskie' },
    { id: 15, name: 'Wielkopolskie' },
    { id: 16, name: 'Zachodniopomorskie' },
  ];

  readers = computed<Reader[]>(() => {
    const groups = new Map<number, Reservation[]>();
    for (const r of this.reservations()) {
      if (!r.reader) continue;
      if (!groups.has(r.reader.id)) groups.set(r.reader.id, []);
      groups.get(r.reader.id)!.push(r);
    }

    const result: Reader[] = [];
    for (const [id, items] of groups) {
      const sample = items[0].reader!;
      result.push({
        id,
        username: sample.username,
        email: sample.email,
        first_name: sample.first_name,
        last_name: sample.last_name,
        region: sample.region,
        date_joined: sample.date_joined,
        activeCount: items.filter((r) => this.activeStatuses.includes(r.status.name)).length,
        completedCount: items.filter((r) => r.status.name === 'closed').length,
        failedCount: items.filter((r) => this.failedStatuses.includes(r.status.name)).length,
      });
    }
    return result.sort((a, b) => a.id - b.id);
  });

  filteredReaders = computed<Reader[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    return this.readers().filter((r) => {
      if (!term) return true;
      return (
        String(r.id).includes(term) ||
        r.username.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        r.first_name.toLowerCase().includes(term) ||
        r.last_name.toLowerCase().includes(term)
      );
    });
  });

  totalPages = computed<number>(() => {
    return Math.max(1, Math.ceil(this.filteredReaders().length / this.pageSize));
  });

  paginatedReaders = computed<Reader[]>(() => {
    const all = this.filteredReaders();
    const start = (this.currentPage() - 1) * this.pageSize;
    return all.slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
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
        this.loadError.set('Nie udało się pobrać listy czytelników.');
        this.isLoading.set(false);
      },
    });
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

  fullName(r: Reader): string {
    return `${r.first_name} ${r.last_name}`.trim() || '-';
  }

  formatDate(dt: string | null): string {
    if (!dt) return '-';
    const d = new Date(dt);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}.${mm}.${d.getFullYear()}`;
  }

  regionName(id: number | null): string {
    if (id === null) return '-';
    return this.regions.find((r) => r.id === id)?.name ?? '-';
  }
}
