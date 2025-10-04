import { ContactCard } from "../crm/contacts/contact-card";
import avatar1 from "@assets/generated_images/Female_agent_professional_headshot_0351dc22.png";
import avatar2 from "@assets/generated_images/Male_agent_professional_headshot_a558128b.png";

export default function ContactCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
      <ContactCard
        id="1"
        name="Sarah Johnson"
        email="sarah.j@email.com"
        phone="(555) 123-4567"
        avatar={avatar1}
        tags={["VIP", "Investor"]}
        lastContact={new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)}
        dealValue="$1.2M"
      />
      <ContactCard
        id="2"
        name="David Martinez"
        email="d.martinez@email.com"
        phone="(555) 234-5678"
        avatar={avatar2}
        tags={["First-time Buyer"]}
        lastContact={new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)}
        dealValue="$475K"
      />
      <ContactCard
        id="3"
        name="Emily Rodriguez"
        email="emily.rod@email.com"
        phone="(555) 345-6789"
        tags={["Seller", "Referral"]}
        lastContact={new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)}
      />
    </div>
  );
}
