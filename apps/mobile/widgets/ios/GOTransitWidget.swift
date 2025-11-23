import WidgetKit
import SwiftUI

// MARK: - Widget Provider
struct GOTransitWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> GOTransitEntry {
        GOTransitEntry(
            date: Date(),
            stationName: "Union Station",
            arrivals: [
                Arrival(routeName: "Lakeshore West", destination: "Union Station", arrivalTime: "5 min", platform: "1", status: "On Time"),
                Arrival(routeName: "Lakeshore East", destination: "Oshawa", arrivalTime: "12 min", platform: "2", status: "On Time")
            ]
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (GOTransitEntry) -> ()) {
        let entry = placeholder(in: context)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<GOTransitEntry>) -> ()) {
        // Fetch data from App Group shared storage
        let widgetData = loadWidgetData()

        let currentDate = Date()
        let entry = GOTransitEntry(
            date: currentDate,
            stationName: widgetData?.stationName ?? "No Station Selected",
            arrivals: widgetData?.arrivals ?? []
        )

        // Refresh every 15 minutes
        let refreshDate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
        let timeline = Timeline(entries: [entry], policy: .after(refreshDate))

        completion(timeline)
    }
}

// MARK: - Widget Data Models
struct Arrival: Codable {
    let routeName: String
    let destination: String
    let arrivalTime: String
    let platform: String?
    let status: String?
}

struct WidgetData: Codable {
    let selectedStationId: String
    let stationName: String
    let arrivals: [Arrival]
    let lastUpdated: TimeInterval
}

// MARK: - Widget Entry
struct GOTransitEntry: TimelineEntry {
    let date: Date
    let stationName: String
    let arrivals: [Arrival]
}

// MARK: - Widget Views
struct GOTransitWidgetSmallView: View {
    var entry: GOTransitEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(entry.stationName)
                .font(.headline)
                .lineLimit(1)

            if let arrival = entry.arrivals.first {
                VStack(alignment: .leading, spacing: 4) {
                    Text(arrival.routeName)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    Text(arrival.destination)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(arrival.arrivalTime)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.blue)
                }
            } else {
                Text("No arrivals")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
    }
}

struct GOTransitWidgetMediumView: View {
    var entry: GOTransitEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(entry.stationName)
                .font(.headline)
                .lineLimit(1)

            if entry.arrivals.isEmpty {
                Text("No upcoming arrivals")
                    .font(.caption)
                    .foregroundColor(.secondary)
            } else {
                ForEach(entry.arrivals.prefix(3), id: \.routeName) { arrival in
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(arrival.routeName)
                                .font(.subheadline)
                                .fontWeight(.semibold)
                            Text("→ \(arrival.destination)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                        Text(arrival.arrivalTime)
                            .font(.subheadline)
                            .fontWeight(.bold)
                            .foregroundColor(.blue)
                    }
                }
            }
        }
        .padding()
    }
}

struct GOTransitWidgetLargeView: View {
    var entry: GOTransitEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(entry.stationName)
                    .font(.title3)
                    .fontWeight(.bold)
                Spacer()
                Image(systemName: "tram.fill")
                    .foregroundColor(.blue)
            }

            Divider()

            if entry.arrivals.isEmpty {
                Text("No upcoming arrivals")
                    .font(.caption)
                    .foregroundColor(.secondary)
            } else {
                ForEach(entry.arrivals.prefix(5), id: \.routeName) { arrival in
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(arrival.routeName)
                                .font(.headline)
                            Spacer()
                            Text(arrival.arrivalTime)
                                .font(.headline)
                                .foregroundColor(.blue)
                        }
                        HStack {
                            Text("→ \(arrival.destination)")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                            Spacer()
                            if let platform = arrival.platform {
                                Text("Platform \(platform)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        if let status = arrival.status {
                            Text(status)
                                .font(.caption)
                                .foregroundColor(status == "On Time" ? .green : .orange)
                        }
                    }
                    .padding(.vertical, 4)

                    if arrival.routeName != entry.arrivals.prefix(5).last?.routeName {
                        Divider()
                    }
                }
            }
        }
        .padding()
    }
}

// MARK: - Widget Configuration
@main
struct GOTransitWidget: Widget {
    let kind: String = "GOTransitWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: GOTransitWidgetProvider()) { entry in
            GOTransitWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("GO Transit Live")
        .description("View arrivals and departures for your favorite station")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct GOTransitWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    var entry: GOTransitEntry

    var body: some View {
        switch family {
        case .systemSmall:
            GOTransitWidgetSmallView(entry: entry)
        case .systemMedium:
            GOTransitWidgetMediumView(entry: entry)
        case .systemLarge:
            GOTransitWidgetLargeView(entry: entry)
        default:
            GOTransitWidgetMediumView(entry: entry)
        }
    }
}

// MARK: - Helper Functions
func loadWidgetData() -> WidgetData? {
    // Load from App Group shared UserDefaults
    let sharedDefaults = UserDefaults(suiteName: "group.com.gotransitlive.app")

    guard let jsonData = sharedDefaults?.data(forKey: "@go_transit_widget_data"),
          let widgetData = try? JSONDecoder().decode(WidgetData.self, from: jsonData) else {
        return nil
    }

    return widgetData
}
