from graphviz import Digraph

# Create a directed graph
dfd = Digraph("Login_DFD", format="png")
dfd.attr(rankdir="LR", size="8")

# Define styles
process_style = {"shape": "circle", "style": "filled", "fillcolor": "lightblue"}
entity_style = {"shape": "rectangle", "style": "filled", "fillcolor": "lightgray"}
data_store_style = {"shape": "cylinder", "style": "filled", "fillcolor": "lightyellow"}

# External Entity
dfd.node("User", **entity_style)

# Processes
dfd.node("Login", **process_style)
dfd.node("Signup", **process_style)
dfd.node("Validate", **process_style)
dfd.node("Logout", **process_style)

# Data Store
dfd.node("Database", **data_store_style)

# Dashboard (treated as process)
dfd.node("Dashboard", **process_style)

# Flows for Signup
dfd.edge("User", "Signup", label="Request")
dfd.edge("Signup", "Database", label="Store Data")
dfd.edge("Database", "User", label="Response")

# Flows for Login
dfd.edge("User", "Login", label="Request")
dfd.edge("Login", "Validate", label="Credentials")
dfd.edge("Validate", "Database", label="Check")
dfd.edge("Database", "Validate", label="Result")
dfd.edge("Validate", "Dashboard", label="Access Granted/Denied")
dfd.edge("Dashboard", "User", label="Response")

# Flows for Logout
dfd.edge("User", "Logout", label="Request")
dfd.edge("Logout", "User", label="Response")
dfd.edge("Logout", "Database", label="End Session")

# Render the diagram to file
file_path = "/mnt/data/clean_login_dfd"
dfd.render(file_path, format="png", cleanup=False)

file_path + ".png"
