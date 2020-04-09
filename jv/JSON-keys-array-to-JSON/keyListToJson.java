import java.util.*;

public class keyListToJson {
	static List<Object> fieldsTree = new ArrayList<Object>();

	public static void main(String args[]) {
		// String[] inputFields = new String[] { "c", "a.b", "c.e.g", "a.b.s", "p.q.r.s", "p.e.r.s", "x.y.z" };
		String[] inputFields = new String[] { "c.e.f", "c.e", "a.b", "c.d"};
		for (String ele : inputFields) {
			String[] inputVal = ele.split("\\.");
			keyToJson(inputVal, fieldsTree);
		}
		System.out.println(fieldsTree.toString().replace("=", ":").replace("label","\"label\"").replace("children","\"children\""));
	}

	static void keyToJson(String[] data, List<Object> refArray) {
		if (data.length > 1) {
			final Map<String, Object> check = find(refArray, data[0]);
			if (check != null)
				keyToJson(Arrays.copyOfRange(data, 1, data.length), (List<Object>) check.get("children"));
			else {
				Map<String, Object> tempJson = new LinkedHashMap<String, Object>();
				tempJson.put("label",  "\"" + data[0]  + "\"");
				tempJson.put("children", new ArrayList<Object>());
				refArray.add(tempJson);
				keyToJson(Arrays.copyOfRange(data, 1, data.length), (List<Object>) tempJson.get("children"));
			}
		}
		final Map<String, Object> check = find(refArray, data[0]);
		if (check == null) {
			Map<String, Object> tempJson = new LinkedHashMap<String, Object>();
			tempJson.put("label", "\"" + data[0]  + "\"");
			tempJson.put("children", new ArrayList<Object>());
			refArray.add(tempJson);
		}
	}

	static Map<String, Object> find(List<Object> arr, String label) {
		Iterator iterator = arr.iterator();
		while (iterator.hasNext()) {
			Map<String, Object> verifiedLabel = (Map<String, Object>) iterator.next();
			if (verifiedLabel.get("label").equals("\"" + label  + "\""))
				return verifiedLabel;
		}
		return null;
	}
}
