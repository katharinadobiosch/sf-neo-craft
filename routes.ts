import {flatRoutes} from '@remix-run/fs-routes';
import {hydrogenRoutes} from '@shopify/hydrogen';
import type {RouteConfig} from '@remix-run/route-config';

export default (async () =>
  hydrogenRoutes([
    ...(await flatRoutes()), // nutzt weiterhin deine File-Routes
    // hier optional manuelle Routes ergänzen
  ])) satisfies RouteConfig;
