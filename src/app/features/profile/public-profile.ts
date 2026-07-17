import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProfileService } from '../../core/services/profile.service';
import { LinkService } from '../../core/services/link.service';
import { Profile } from '../../core/models/profile.model';
import { Link } from '../../core/models/link.model';

@Component({
  selector: 'app-public-profile',
  imports: [RouterLink],
  templateUrl: './public-profile.html',
  styleUrl: './public-profile.scss',
})
export class PublicProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly profiles = inject(ProfileService);
  private readonly linksService = inject(LinkService);

  readonly profile = signal<Profile | null>(null);
  readonly links = signal<Link[]>([]);
  readonly loading = signal(true);
  readonly notFound = signal(false);

  ngOnInit(): void {
    const handle = this.route.snapshot.paramMap.get('handle') ?? '';
    this.load(handle);
  }

  private async load(handle: string): Promise<void> {
    this.loading.set(true);
    const profile = await this.profiles.getByHandle(handle);
    if (!profile) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }
    this.profile.set(profile);
    const links = await this.linksService.listByHandle(handle);
    this.links.set(links);
    this.loading.set(false);
  }

  initial(name: string): string {
    return (name || '؟').trim().charAt(0) || '؟';
  }
}
