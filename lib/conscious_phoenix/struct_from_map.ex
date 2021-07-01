defmodule ConsciousPhoenix.StructFromMap do
	# fetch a_struct's keys from a map "with_indifferent_access"
	def convert_with_indifferent_access(a_map, as: a_struct) do
		# Find the keys within the map
		keys = Map.keys(a_struct)
						 |> Enum.filter(fn x -> x != :__struct__ end)
		# Process map, checking for both string / atom keys
		processed_map =
		 for key <- keys, into: %{} do
				 value = Map.get(a_map, key) || Map.get(a_map, to_string(key))
				 {key, value}
			 end
		a_struct = Map.merge(a_struct, processed_map)
		a_struct
	end
end
