import { Component, Inject, OnInit } from '@angular/core';
import { GEOLOCATION_SUPPORT, GeolocationService } from '@ng-web-apis/geolocation';
import { LatLngExpression } from 'leaflet';
import * as Leaflet from 'leaflet';
import { Observable, Subscription, take } from 'rxjs';
import { LocationInterface } from '../../../models/interfaces/location.interface';
import { HelperService } from '../../../services/helper.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-collect-points',
  templateUrl: './collect-points.page.html',
  styleUrls: ['./collect-points.page.scss'],
})
export class CollectPointsPage implements OnInit {

  constructor(
    private readonly helper: HelperService,
    private readonly geolocation$: GeolocationService,
    private readonly userService: UserService,
    @Inject(GEOLOCATION_SUPPORT) private readonly geolocationSupport: boolean,
  ) {
    const resp = this.userService.get();

    if (resp.role === 'admin')
      this.isAdmin = true;
  }

  public map!: Leaflet.Map;

  public currentLocation: LocationInterface = {
    latitude: 0,
    longitude: 0,
  };

  public greenIcon = Leaflet.icon({
    iconUrl: 'assets/images/leaf-green.png',
    iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  });

  public currentIcon = Leaflet.icon({
    iconUrl: 'assets/images/current-location.png',
    iconSize:     [38, 40], // size of the icon
    shadowSize:   [50, 9], // size of the shadow
    iconAnchor:   [22, 39], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 7],  // the same for the shadow
    popupAnchor:  [-3, -131] // point from which the popup should open relative to the iconAnchor
  });

  public collectPoints: LocationInterface[] = [
    {
      latitude: -23.477656,
      longitude: -47.4929819,
    },
    {
      latitude: -23.3975345,
      longitude: -47.3801152,
    },
  ];

  public isAdmin: boolean = false;

  public ngOnInit(): void {
    this.geolocation$.pipe(take(1)).subscribe(position => {
      this.successCallback(position);
      this.initMap();

      this.collectPoints.forEach(item => {
        Leaflet.marker([item.latitude, item.longitude], {icon: this.greenIcon}).addTo(this.map);
      })

      Leaflet.marker([this.currentLocation.latitude, this.currentLocation.longitude], { icon: this.currentIcon }).addTo(this.map);
    });
  }

  private initMap(): void {
    this.map = Leaflet.map('map', {
      zoom: 3,
    }).setView([this.currentLocation.latitude, this.currentLocation.longitude], 15);

    const tiles = Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        minZoom: 3,
      },
    );
    tiles.addTo(this.map);
  }

  public successCallback(position: GeolocationPosition): void {
    this.currentLocation.latitude = position.coords.latitude;
    this.currentLocation.longitude = position.coords.longitude;
  }

}
