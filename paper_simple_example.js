paper_simple_example_json = {
"name": "root",
"children": [
	{
	"name": "shallow",
	"size": 5
	},
	{
	"name": "medium",
	"children": [
		{"name": "medium1", "size": 1},
		{"name": "medium2", "size": 2},
		{"name": "medium3", "size": 3},
		{"name": "medium4", "size": 4}
	]
	},
	{
	"name": "deep",
	"children": [
		{"name": "deep1", 
		"children": [
			{"name": "deep1leaf1", "size": 1},
			{"name": "deep1leaf2", "size": 1},
			{"name": "deep1leaf3", "size": 1},
			{"name": "deep1leaf4", "size": 1},
			{"name": "deep1leaf5", "size": 1}
		]
		},
		{"name": "deep2", 
		"children": [
			{"name": "deep2leaf1", "size": 2},
			{"name": "deep2leaf2", "size": 3}
		]
		}
	]
	}
]
}
