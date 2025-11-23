package com.gotransitlive.app.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.gotransitlive.app.R
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

/**
 * GO Transit Live Widget Provider
 * Displays arrivals and departures for a selected favorite station
 */
class GOTransitWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        // Update each widget instance
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onEnabled(context: Context) {
        // Enter relevant functionality when the first widget is created
    }

    override fun onDisabled(context: Context) {
        // Enter relevant functionality when the last widget is disabled
    }

    companion object {
        internal fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val widgetData = loadWidgetData(context)

            // Construct the RemoteViews object
            val views = RemoteViews(context.packageName, R.layout.widget_go_transit)

            if (widgetData != null) {
                views.setTextViewText(R.id.widget_station_name, widgetData.stationName)

                // Display arrivals
                val arrivals = widgetData.arrivals
                if (arrivals.isNotEmpty()) {
                    views.setTextViewText(
                        R.id.widget_arrival_1_route,
                        arrivals.getOrNull(0)?.routeName ?: ""
                    )
                    views.setTextViewText(
                        R.id.widget_arrival_1_destination,
                        arrivals.getOrNull(0)?.destination?.let { "→ $it" } ?: ""
                    )
                    views.setTextViewText(
                        R.id.widget_arrival_1_time,
                        arrivals.getOrNull(0)?.arrivalTime ?: ""
                    )

                    if (arrivals.size > 1) {
                        views.setTextViewText(
                            R.id.widget_arrival_2_route,
                            arrivals.getOrNull(1)?.routeName ?: ""
                        )
                        views.setTextViewText(
                            R.id.widget_arrival_2_destination,
                            arrivals.getOrNull(1)?.destination?.let { "→ $it" } ?: ""
                        )
                        views.setTextViewText(
                            R.id.widget_arrival_2_time,
                            arrivals.getOrNull(1)?.arrivalTime ?: ""
                        )
                    }

                    if (arrivals.size > 2) {
                        views.setTextViewText(
                            R.id.widget_arrival_3_route,
                            arrivals.getOrNull(2)?.routeName ?: ""
                        )
                        views.setTextViewText(
                            R.id.widget_arrival_3_destination,
                            arrivals.getOrNull(2)?.destination?.let { "→ $it" } ?: ""
                        )
                        views.setTextViewText(
                            R.id.widget_arrival_3_time,
                            arrivals.getOrNull(2)?.arrivalTime ?: ""
                        )
                    }
                } else {
                    views.setTextViewText(R.id.widget_no_arrivals, "No upcoming arrivals")
                }

                // Update last updated time
                val lastUpdated = Date(widgetData.lastUpdated)
                val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
                views.setTextViewText(
                    R.id.widget_last_updated,
                    "Updated: ${timeFormat.format(lastUpdated)}"
                )
            } else {
                views.setTextViewText(R.id.widget_station_name, "No Station Selected")
                views.setTextViewText(R.id.widget_no_arrivals, "Select a favorite station in the app")
            }

            // Set up click intent to open the app
            val intent = Intent(context, context.packageManager.getLaunchIntentForPackage(context.packageName)?.component?.className?.let { Class.forName(it) })
            val pendingIntent = android.app.PendingIntent.getActivity(
                context,
                0,
                intent,
                android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

            // Update the widget
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun loadWidgetData(context: Context): WidgetData? {
            return try {
                val sharedPreferences = context.getSharedPreferences(
                    "go_transit_preferences",
                    Context.MODE_PRIVATE
                )

                val jsonString = sharedPreferences.getString("@go_transit_widget_data", null)
                    ?: return null

                val jsonObject = JSONObject(jsonString)
                val arrivalsArray = jsonObject.getJSONArray("arrivals")

                val arrivals = mutableListOf<Arrival>()
                for (i in 0 until arrivalsArray.length()) {
                    val arrivalObj = arrivalsArray.getJSONObject(i)
                    arrivals.add(
                        Arrival(
                            routeName = arrivalObj.getString("routeName"),
                            destination = arrivalObj.getString("destination"),
                            arrivalTime = arrivalObj.getString("arrivalTime"),
                            platform = arrivalObj.optString("platform"),
                            status = arrivalObj.optString("status")
                        )
                    )
                }

                WidgetData(
                    selectedStationId = jsonObject.getString("selectedStationId"),
                    stationName = jsonObject.getString("stationName"),
                    arrivals = arrivals,
                    lastUpdated = jsonObject.getLong("lastUpdated")
                )
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }
    }
}

// Data classes
data class WidgetData(
    val selectedStationId: String,
    val stationName: String,
    val arrivals: List<Arrival>,
    val lastUpdated: Long
)

data class Arrival(
    val routeName: String,
    val destination: String,
    val arrivalTime: String,
    val platform: String?,
    val status: String?
)
