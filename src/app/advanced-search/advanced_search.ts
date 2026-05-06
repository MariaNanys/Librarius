import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SearchAdvanceService } from '../services/search-advance.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export interface SearchBookPayload {
  title?: string;
  author_ids?: number[] | string;
  isbn?: number | null;
  published_year_min?: string;
  published_year_max?: string;
  publisher?: string;
  languages?: string[] | string;
}

@Component({
  selector: 'app-advanced_search',
  standalone: true,
  imports: [],
  templateUrl: './advanced_search.html',
  styleUrl: './advanced_search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class AdvanceSearchComponent implements OnInit {
  private searchService = inject(SearchAdvanceService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = computed(() => this.authService.currentUser() !== null);

  searchTitle = signal<string>('');
  resourceNumber = signal<number | null>(null);
  dateFrom = signal<string>('');
  dateTo = signal<string>('');
  publisher = signal<string>('');

  isDateRangeInvalid = computed(() => {
    const from = this.dateFrom();
    const to = this.dateTo();

    if (!from || !to) return false;

    return Number(from) > Number(to); 
  });

  authors = signal<{ id: number; name: string }[]>([]);
  languages = signal<{ code: string; display: string }[]>([]);

  isAuthorOpen = signal(false);
  isLanguageOpen = signal(false);

  selectedAuthorIds = signal<number[]>([]);
  selectedLanguageIds = signal<string[]>([]);

  searchAuthorTerm = signal('');
  searchLanguageTerm = signal('');

  filteredAuthors = computed(() => this.authors().filter(a => a.name.toLowerCase().includes(this.searchAuthorTerm().toLowerCase())));
  selectedAuthorsObjects = computed(() => this.authors().filter(a => this.selectedAuthorIds().includes(a.id)));

  filteredLanguages = computed(() => this.languages().filter(l => l.display.toLowerCase().includes(this.searchLanguageTerm().toLowerCase())));
  selectedLanguagesObjects = computed(() => this.languages().filter(l => this.selectedLanguageIds().includes(l.code)));

  ngOnInit() {
    this.searchService.getAuthors().subscribe({ next: data => this.authors.set(data), error: err => console.error(err) });
    this.searchService.getLanguages().subscribe({ next: data => this.languages.set(data), error: err => console.error(err) });
  }

  toggleAuthorDropdown() {
    this.isAuthorOpen.update(v => !v);
    this.isLanguageOpen.set(false);
  }

  toggleLanguageDropdown() {
    this.isLanguageOpen.update(v => !v);
    this.isAuthorOpen.set(false);
  }

  toggleSelection(code: string | number, signalRef: any) {
    signalRef.update((currentIds: (string | number)[]) => 
      currentIds.includes(code) ? currentIds.filter((i: string | number) => i !== code) : [...currentIds, code]
    );
  }

  removeSelection(code: string | number, event: Event, signalRef: any) {
    event.stopPropagation();
    signalRef.update((currentIds: string[] | number[]) => currentIds.filter((i: string | number) => i !== code));
  }

  updateSearchTerm(event: Event, signalRef: any) {
    signalRef.set((event.target as HTMLInputElement).value);
  }

  onSubmit() {
    if (this.isDateRangeInvalid()) {
      return; 
    }

    const payload: SearchBookPayload = {
      title: this.searchTitle(),
      author_ids: this.selectedAuthorIds().length > 0 ? this.selectedAuthorIds().join(',') : undefined,
      isbn: this.resourceNumber() ? Number(this.resourceNumber()) : null,
      published_year_min: this.dateFrom(),
      published_year_max: this.dateTo(),
      publisher: this.publisher(),
      languages: this.selectedLanguageIds().length > 0 ? this.selectedLanguageIds().join(',') : undefined
    };

    if (!payload.title) delete payload.title;
    if (!payload.isbn) delete payload.isbn;
    if (!payload.published_year_min) delete payload.published_year_min;
    if (!payload.published_year_max) delete payload.published_year_max;
    if (!payload.publisher) delete payload.publisher;
    if (!payload.author_ids) delete payload.author_ids;
    if (!payload.languages) delete payload.languages;

    this.router.navigate(['/search'], { queryParams: { ...payload, advanced: 'true' } });
  }
}