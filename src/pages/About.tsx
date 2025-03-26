
import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/ui/Container';
import { Button } from '@/components/ui/button';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <Container>
          {/* Hero Section */}
          <div className="py-12 md:py-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">О компании JANA</h1>
            <p className="text-muted-foreground max-w-3xl mb-8">
              Мы объединяем уникальные товары со всего мира на одной платформе, создавая пространство для особенных покупок.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.1s' }}>
                <img 
                  src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&auto=format&fit=crop" 
                  alt="Команда JANA" 
                  className="rounded-xl h-96 w-full object-cover"
                />
              </div>
              <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-2xl font-semibold mb-4">Наша история</h2>
                <p className="text-muted-foreground mb-6">
                  JANA была основана в 2022 году группой энтузиастов, увлеченных идеей создать платформу, объединяющую уникальные товары со всего мира. 
                  Мы начали с небольшой коллекции предметов ручной работы и со временем расширили ассортимент до тысяч уникальных товаров.
                </p>
                <p className="text-muted-foreground mb-6">
                  Сегодня JANA - это пространство, где каждый может найти что-то особенное и уникальное. Мы сотрудничаем с сотнями производителей 
                  со всего мира, предлагая нашим клиентам только лучшие товары высокого качества.
                </p>
                <Button className="rounded-full">Узнать больше</Button>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="py-12 md:py-16 border-t border-muted">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">Наши ценности</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Качество',
                  description: 'Мы тщательно отбираем каждый товар, гарантируя высокое качество всей нашей продукции.',
                  icon: '✨'
                },
                {
                  title: 'Уникальность',
                  description: 'Мы ценим оригинальные идеи и уникальные товары, которые нельзя найти в обычных магазинах.',
                  icon: '🌟'
                },
                {
                  title: 'Забота о клиентах',
                  description: 'Наша команда всегда готова помочь и предоставить лучший сервис каждому клиенту.',
                  icon: '💫'
                }
              ].map((value, index) => (
                <div 
                  key={value.title}
                  className="flex flex-col items-center text-center p-6 rounded-xl bg-white shadow-subtle hover:shadow-product transition-all duration-300 animate-fade-in opacity-0"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-lg font-medium mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="py-12 md:py-16 border-t border-muted">
            <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">Наша команда</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: 'Анна Петрова',
                  role: 'Основатель и CEO',
                  image: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=400&auto=format&fit=crop'
                },
                {
                  name: 'Иван Смирнов',
                  role: 'Технический директор',
                  image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&auto=format&fit=crop'
                },
                {
                  name: 'Мария Иванова',
                  role: 'Директор по маркетингу',
                  image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&auto=format&fit=crop'
                }
              ].map((member, index) => (
                <div 
                  key={member.name}
                  className="flex flex-col items-center text-center animate-fade-in opacity-0"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="mb-4 rounded-full overflow-hidden w-40 h-40">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-medium">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default About;
